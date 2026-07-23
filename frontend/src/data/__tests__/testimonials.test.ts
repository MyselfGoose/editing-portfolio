import { describe, expect, it } from "vitest";

import {
  getPublishableTestimonials,
  testimonials,
} from "@/data/testimonials";

describe("testimonials", () => {
  it("ships empty until real quotes exist", () => {
    expect(testimonials).toHaveLength(0);
    expect(getPublishableTestimonials()).toHaveLength(0);
  });
});
