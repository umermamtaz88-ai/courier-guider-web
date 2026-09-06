"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const BOTTOM_THRESHOLD = 120;

export function useScrollBehavior(deps: unknown[] = [], enabled = true) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const userScrolledUpRef = useRef(false);

  const checkNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < BOTTOM_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
    setShowNewMessageButton(false);
    userScrolledUpRef.current = false;
    setIsNearBottom(true);
  }, []);

  const scrollToTop = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "instant" });
    userScrolledUpRef.current = false;
    setShowNewMessageButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    const near = checkNearBottom();
    setIsNearBottom(near);
    if (!near) {
      userScrolledUpRef.current = true;
    } else {
      userScrolledUpRef.current = false;
      setShowNewMessageButton(false);
    }
  }, [checkNearBottom]);

  const onNewContent = useCallback(() => {
    if (!enabled) return;
    if (userScrolledUpRef.current || !checkNearBottom()) {
      setShowNewMessageButton(true);
      return;
    }
    scrollToBottom(true);
  }, [checkNearBottom, scrollToBottom, enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!userScrolledUpRef.current) {
      scrollToBottom(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return {
    containerRef,
    isNearBottom,
    showNewMessageButton,
    scrollToBottom,
    scrollToTop,
    handleScroll,
    onNewContent,
  };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
