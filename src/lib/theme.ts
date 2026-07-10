/**
 * Brand tokens ported from design-reference/prototype.jsx (the `T` theme object).
 * Branding is not final — this is the single source of truth for raw colour/font
 * values needed outside Tailwind's CSS variables (e.g. React Email templates,
 * which render in email clients that don't see globals.css).
 *
 * Tailwind utility classes (bg-plum, text-honey, font-display, etc.) read the
 * same values via the CSS custom properties defined in src/app/globals.css —
 * update both files together if these ever change.
 */
export const theme = {
  colors: {
    paper: "#FBF7F0",
    card: "#FFFFFF",
    ink: "#241722",
    plum: "#5C2E4E",
    plumDark: "#3D1E33",
    honey: "#D99C2B",
    honeySoft: "#F6E7C6",
    sage: "#7A8B6F",
    line: "#E8DFD2",
    red: "#B3402F",
    green: "#3E7A4E",
  },
  font: {
    display: "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",
    body: "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  },
} as const;
