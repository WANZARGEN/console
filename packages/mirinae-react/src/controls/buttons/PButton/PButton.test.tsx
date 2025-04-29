import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { composeStories } from "@storybook/react";

import * as stories from "./PButton.stories";

const { Primary, Secondary, Tertiary, Small, Medium, Large } =
  composeStories(stories);

describe("PButton", () => {
  it("renders button with default props", async () => {
    await Primary.run();
    const button = screen.getByRole("button", { name: "Primary Button" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary-dark");
    expect(button).not.toBeDisabled();
  });

  it("renders button with different style types", async () => {
    await Secondary.run();
    let button = screen.getByRole("button");
    expect(button).toHaveClass("bg-white", "text-primary", "border-primary1");

    await Tertiary.run();
    button = screen.getByRole("button");
    expect(button).toHaveClass("bg-white", "text-gray-900", "border-gray-300");
  });

  it("renders button with different sizes", async () => {
    await Small.run();
    let button = screen.getByRole("button");
    expect(button).toHaveClass("h-6", "text-xs");

    await Medium.run();
    button = screen.getByRole("button");
    expect(button).toHaveClass("h-8", "text-sm");

    await Large.run();
    button = screen.getByRole("button");
    expect(button).toHaveClass("h-10", "text-base");
  });

  it("handles click events", async () => {
    const onClick = vi.fn();
    render(<Primary onClick={onClick} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
