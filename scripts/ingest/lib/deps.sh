#!/usr/bin/env bash
# OS detection and automatic dependency installation.

DEPS_OS_FAMILY=""
DEPS_OS_ID=""

deps_detect_os() {
  DEPS_OS_FAMILY="unknown"
  DEPS_OS_ID="unknown"

  local kernel
  kernel="$(uname -s)"
  if [[ "$kernel" == "Darwin" ]]; then
    DEPS_OS_FAMILY="macos"
    DEPS_OS_ID="macos"
    return 0
  fi

  if [[ -f /etc/os-release ]]; then
    local id like
    # shellcheck disable=SC1091
    source /etc/os-release
    id="${ID:-unknown}"
    like="${ID_LIKE:-}"
    DEPS_OS_ID="$id"

    case "$id" in
      arch|cachyos|endeavouros|manjaro|garuda|artix) DEPS_OS_FAMILY="arch" ;;
      ubuntu|debian|pop|linuxmint|elementary|zorin|kali) DEPS_OS_FAMILY="debian" ;;
      fedora|rhel|centos|rocky|almalinux|nobara) DEPS_OS_FAMILY="fedora" ;;
      opensuse*|suse|opensuse-tumbleweed|opensuse-leap) DEPS_OS_FAMILY="suse" ;;
      alpine) DEPS_OS_FAMILY="alpine" ;;
      *)
        if [[ "$like" == *arch* ]]; then DEPS_OS_FAMILY="arch"
        elif [[ "$like" == *debian* ]] || [[ "$like" == *ubuntu* ]]; then DEPS_OS_FAMILY="debian"
        elif [[ "$like" == *fedora* ]] || [[ "$like" == *rhel* ]]; then DEPS_OS_FAMILY="fedora"
        elif [[ "$like" == *suse* ]]; then DEPS_OS_FAMILY="suse"
        fi
        ;;
    esac
  fi
}

deps_os_label() {
  deps_detect_os
  case "$DEPS_OS_FAMILY" in
    arch) printf 'Arch Linux (%s)' "${DEPS_OS_ID}" ;;
    debian) printf 'Debian/Ubuntu (%s)' "${DEPS_OS_ID}" ;;
    fedora) printf 'Fedora/RHEL (%s)' "${DEPS_OS_ID}" ;;
    suse) printf 'openSUSE (%s)' "${DEPS_OS_ID}" ;;
    alpine) printf 'Alpine (%s)' "${DEPS_OS_ID}" ;;
    macos) printf 'macOS' ;;
    *) printf 'Linux (%s)' "${DEPS_OS_ID}" ;;
  esac
}

deps_has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

deps_run_privileged() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
    return $?
  fi
  if command -v sudo >/dev/null 2>&1; then
  if [[ -t 0 ]]; then
      sudo "$@"
      return $?
    fi
    if sudo -n true 2>/dev/null; then
      sudo "$@"
      return $?
    fi
    ui_warn "Administrator access required to install packages."
    if ui_confirm "Run with sudo now?"; then
      sudo "$@"
      return $?
    fi
    return 1
  fi
  ui_err "Need root or sudo to install system packages."
  return 1
}

deps_ensure_brew() {
  if deps_has_cmd brew; then
    return 0
  fi
  ui_warn "Homebrew not found (required on macOS for some tools)."
  if ui_confirm "Install Homebrew from https://brew.sh?"; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [[ -x /opt/homebrew/bin/brew ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -x /usr/local/bin/brew ]]; then
      eval "$(/usr/local/bin/brew shellenv)"
    fi
  fi
  deps_has_cmd brew
}

deps_pkg_name() {
  local tool="$1"
  case "$tool" in
    ffprobe) printf 'ffmpeg' ;;
    *) printf '%s' "$tool" ;;
  esac
}

deps_install_via_pm() {
  local tool="$1"
  local pkg
  pkg="$(deps_pkg_name "$tool")"
  deps_detect_os

  ui_dim "Installing ${pkg} via ${DEPS_OS_FAMILY} package manager..."

  case "$DEPS_OS_FAMILY" in
    arch)
      deps_run_privileged pacman -S --needed --noconfirm "$pkg"
      ;;
    debian)
      deps_run_privileged apt-get update -qq
      DEPS_RUN_PRIV_APT=1 deps_run_privileged env DEBIAN_FRONTEND=noninteractive apt-get install -y "$pkg"
      ;;
    fedora)
      deps_run_privileged dnf install -y "$pkg"
      ;;
    suse)
      deps_run_privileged zypper --non-interactive install "$pkg"
      ;;
    alpine)
      deps_run_privileged apk add --no-cache "$pkg"
      ;;
    macos)
      deps_ensure_brew || return 1
      brew install "$pkg"
      ;;
    *)
      return 1
      ;;
  esac
}

deps_install_rclone_script() {
  ui_dim "Installing rclone via official install script..."
  if ! command -v curl >/dev/null 2>&1; then
    ui_err "curl required to install rclone"
    return 1
  fi
  local tmp
  tmp="$(mktemp)"
  if ! curl -fsSL https://rclone.org/install.sh -o "$tmp"; then
    rm -f "$tmp"
    return 1
  fi
  deps_run_privileged bash "$tmp"
  local rc=$?
  rm -f "$tmp"
  return "$rc"
}

deps_install_tool() {
  local tool="$1"

  if [[ "$tool" == "ffprobe" ]]; then
    probe_has_ffprobe && return 0
  elif deps_has_cmd "$tool"; then
    return 0
  fi

  if deps_install_via_pm "$tool"; then
    if [[ "$tool" == "ffprobe" ]]; then
      probe_has_ffprobe && return 0
    elif deps_has_cmd "$tool"; then
      return 0
    fi
  fi

  if [[ "$tool" == "rclone" ]] && ! deps_has_cmd rclone; then
    deps_install_rclone_script && deps_has_cmd rclone && return 0
  fi

  return 1
}

deps_install_required() {
  local tool failed=0
  for tool in curl jq rclone; do
    if [[ "$tool" == "rclone" ]] && deps_has_cmd rclone; then
      ui_ok "${tool} already installed"
      continue
    fi
    if [[ "$tool" != "rclone" ]] && deps_has_cmd "$tool"; then
      ui_ok "${tool} already installed"
      continue
    fi
    ui_section "Installing ${tool}"
    if deps_install_tool "$tool"; then
      ui_ok "Installed ${tool}"
    else
      ui_err "Failed to install ${tool}"
      failed=$((failed + 1))
    fi
  done
  return "$failed"
}

deps_install_optional() {
  if probe_has_ffprobe; then
    ui_ok "ffprobe already installed"
    return 0
  fi
  ui_section "Installing ffmpeg (ffprobe)"
  if deps_install_tool "ffprobe"; then
    ui_ok "Installed ffmpeg"
    return 0
  fi
  ui_warn "Could not install ffmpeg — duration/aspect will use defaults"
  return 0
}

deps_install_all() {
  deps_detect_os
  ui_section "Detected OS: $(deps_os_label)"
  local failures=0
  deps_install_required || failures=$?
  deps_install_optional
  return "$failures"
}
