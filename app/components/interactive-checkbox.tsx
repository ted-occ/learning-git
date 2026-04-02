"use client";

import { useState } from "react";

export default function InteractiveCheckbox({
  defaultChecked,
}: {
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => setChecked(!checked)}
      className="mr-1 h-4 w-4 cursor-pointer accent-blue-600"
    />
  );
}
