import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

// Raw hex values, not Tailwind classes — email clients don't load globals.css,
// so this mirrors src/lib/theme.ts by hand (see that file's own comment).
const colors = {
  paper: "#FBF7F0",
  ink: "#241722",
  plumDark: "#3D1E33",
  honey: "#D99C2B",
  line: "#E8DFD2",
};

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.paper,
          fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
          color: colors.ink,
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            border: `1px solid ${colors.line}`,
            maxWidth: 560,
            overflow: "hidden",
          }}
        >
          <Section style={{ backgroundColor: colors.plumDark, padding: "18px 28px" }}>
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: 0 }}>
              Hair Suppliers Australia
            </Text>
            <Text
              style={{
                color: colors.honey,
                fontSize: 10.5,
                letterSpacing: 2,
                fontWeight: 800,
                margin: "2px 0 0",
                textTransform: "uppercase",
              }}
            >
              Wholesale Portal
            </Text>
          </Section>
          <Section style={{ padding: "24px 28px" }}>{children}</Section>
          <Hr style={{ borderColor: colors.line, margin: 0 }} />
          <Section style={{ padding: "16px 28px" }}>
            <Text style={{ fontSize: 11.5, color: "#8a7d72", margin: 0 }}>
              Hair Suppliers Australia — wholesale partner of Nature&apos;s Hair retail stores.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
