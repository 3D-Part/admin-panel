export interface TextComponentInterface {
  children: React.ReactNode;
  className?: string;
}

export interface ParagraphComponentInterface extends TextComponentInterface {
  size: "L" | "M" | "S" | "XS";
  weight: "Semibold" | "Medium" | "Regular";
}
