// Public operator details only. Complete these with the owner's confirmed data.
// Never infer an operator's identity from OAuth credentials or administrator emails.
export const siteOperator: {
  name: string | null;
  taxId: string | null;
  address: string | null;
  email: string | null;
  registry: string | null;
} = { name: null, taxId: null, address: null, email: null, registry: null };

export const legalDetailsComplete = Boolean(siteOperator.name && siteOperator.taxId && siteOperator.address && siteOperator.email);
export const legalReviewDate = "16 de septiembre de 2026";
export const informationLinks = [
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/sobre-nosotros", label: "Sobre Tripu" },
  { href: "/contacto", label: "Contacto" },
];
export const legalLinks = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
  { href: "/condiciones", label: "Condiciones de uso" },
];
