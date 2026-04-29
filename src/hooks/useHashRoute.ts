import { useCallback, useEffect, useState } from "react";

const normalizePath = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "#") {
    return "/";
  }

  if (trimmed.startsWith("#")) {
    return normalizePath(trimmed.slice(1));
  }

  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }

  return trimmed;
};

const readCurrentPath = (): string => {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizePath(window.location.hash);
};

export const useHashRoute = () => {
  const [path, setPath] = useState<string>(() => readCurrentPath());

  useEffect(() => {
    const onHashChange = () => {
      setPath(readCurrentPath());
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const navigate = useCallback((nextPath: string) => {
    const normalized = normalizePath(nextPath);
    if (typeof window === "undefined") {
      return;
    }

    if (readCurrentPath() === normalized) {
      return;
    }

    window.location.hash = normalized;
  }, []);

  return {
    path,
    navigate,
  };
};
