import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { composeStories } from "@storybook/react";
import * as stories from "./Button.stories";

const {
  Default,
  Primary,
  Secondary,
  Tertiary,
  Small,
  Medium,
  Large,
  Disabled,
} = composeStories(stories);

describe("Button", () => {
  // 렌더링 테스트
  describe("Rendering", () => {
    it("renders with default props", async () => {
      await Default.run();
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("Button")).toBeInTheDocument();
    });

    it("renders with different variants", async () => {
      await Primary.run();
      expect(screen.getByRole("button")).toHaveClass("bg-blue-500");

      await Secondary.run();
      expect(screen.getByRole("button")).toHaveClass("bg-gray-200");

      await Tertiary.run();
      expect(screen.getByRole("button")).toHaveClass("bg-transparent");
    });

    it("renders with different sizes", async () => {
      await Small.run();
      expect(screen.getByRole("button")).toHaveClass("text-sm");

      await Medium.run();
      expect(screen.getByRole("button")).toHaveClass("text-base");

      await Large.run();
      expect(screen.getByRole("button")).toHaveClass("text-lg");
    });

    it("renders disabled state", async () => {
      await Disabled.run();
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByRole("button")).toHaveClass("opacity-50");
    });
  });

  // 상호작용 테스트
  describe("Interactions", () => {
    it("handles click events", async () => {
      const handleClick = vi.fn();
      render(<Default onClick={handleClick} />);

      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not trigger click events when disabled", async () => {
      const handleClick = vi.fn();
      render(<Disabled onClick={handleClick} />);

      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("handles keyboard events", async () => {
      const handleClick = vi.fn();
      render(<Default onClick={handleClick} />);

      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(screen.getByRole("button"), { key: " " });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  // 접근성 테스트
  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<Default aria-label="Submit form" />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Submit form",
      );
    });

    it("maintains focus state", () => {
      render(<Default />);
      const button = screen.getByRole("button");

      fireEvent.focus(button);
      expect(button).toHaveClass("focus:ring-2");

      fireEvent.blur(button);
      expect(button).not.toHaveClass("focus:ring-2");
    });
  });

  // 시각적 테스트
  describe("Visual", () => {
    it("applies hover styles", async () => {
      await Primary.run();
      const button = screen.getByRole("button");

      fireEvent.mouseEnter(button);
      expect(button).toHaveClass("hover:bg-blue-600");
    });

    it("applies active styles", async () => {
      await Primary.run();
      const button = screen.getByRole("button");

      fireEvent.mouseDown(button);
      expect(button).toHaveClass("active:bg-blue-700");
    });
  });

  // 엣지 케이스 테스트
  describe("Edge Cases", () => {
    it("handles empty children", () => {
      render(<Default />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("handles long text content", () => {
      const longText = "a".repeat(100);
      render(<Default>{longText}</Default>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("handles special characters in text", () => {
      render(<Default>Special & chars</Default>);
      expect(screen.getByText("Special & chars")).toBeInTheDocument();
    });
  });
});
