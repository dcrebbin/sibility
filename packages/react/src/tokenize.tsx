import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { tokenizeText } from "@sibility/core";

const WORD_REGEX = /(\S+|\s+)/g;

export function wrapTextWithWordSpans(text: string, wordOffset = 0): ReactNode[] {
  const parts = text.match(WORD_REGEX) ?? [];
  let wordIndex = wordOffset;

  return parts.map((part, i) => {
    if (/^\s+$/.test(part)) {
      return part;
    }

    const index = wordIndex;
    wordIndex += 1;

    return (
      <span key={`${index}-${i}`} data-word-index={index}>
        {part}
      </span>
    );
  });
}

function wrapNodeChildren(node: ReactNode, wordOffset: { current: number }): ReactNode {
  if (typeof node === "string") {
    const wrapped = wrapTextWithWordSpans(node, wordOffset.current);
    wordOffset.current += tokenizeText(node).length;
    return wrapped;
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <span key={i}>{wrapNodeChildren(child, wordOffset)}</span>
    ));
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    if (element.props.children) {
      return cloneElement(element, {
        ...element.props,
        children: wrapNodeChildren(element.props.children, wordOffset),
      });
    }
  }

  return node;
}

export function wrapContentWithWordSpans(children: ReactNode): ReactNode {
  const wordOffset = { current: 0 };
  return Children.map(children, (child) => wrapNodeChildren(child, wordOffset));
}
