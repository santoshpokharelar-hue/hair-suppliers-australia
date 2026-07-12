import { formatAUD } from "@/lib/format";

export type EmailLineItem = {
  sku: string;
  nameSnapshot: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

const cellStyle = { padding: "6px 0", borderBottom: "1px solid #F3EEE6" };
const headStyle = { ...cellStyle, fontWeight: 700, borderBottom: "1px solid #E8DFD2" };

export function ItemsTable({ items }: { items: EmailLineItem[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} cellPadding={0} cellSpacing={0}>
      <thead>
        <tr>
          <td style={headStyle}>Item</td>
          <td style={{ ...headStyle, textAlign: "right" }}>Qty</td>
          <td style={{ ...headStyle, textAlign: "right" }}>Unit</td>
          <td style={{ ...headStyle, textAlign: "right" }}>Total</td>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.sku}>
            <td style={cellStyle}>
              {item.nameSnapshot}
              <br />
              <span style={{ color: "#8a7d72", fontSize: 11 }}>SKU {item.sku}</span>
            </td>
            <td style={{ ...cellStyle, textAlign: "right" }}>{item.qty}</td>
            <td style={{ ...cellStyle, textAlign: "right" }}>{formatAUD(item.unitPriceCents)}</td>
            <td style={{ ...cellStyle, textAlign: "right" }}>{formatAUD(item.lineTotalCents)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TotalsRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <table style={{ width: "100%", fontSize: bold ? 15 : 13, marginTop: 4 }}>
      <tbody>
        <tr>
          <td style={{ padding: "3px 0", fontWeight: bold ? 800 : 500 }}>{label}</td>
          <td style={{ padding: "3px 0", textAlign: "right", fontWeight: bold ? 800 : 500 }}>{value}</td>
        </tr>
      </tbody>
    </table>
  );
}
