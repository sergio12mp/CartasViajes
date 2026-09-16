// Public operator details only. Complete these with the owner's confirmed data.
// Never infer an operator's identity from OAuth credentials or administrator emails.
export const siteOperator: {
  name: string | null;
  country: string;
  taxId: string | null;
  address: string | null;
  email: string | null;
  registry: string | null;
} = {
  name: "Sergio Morejon Perez",
  country: "España",
  taxId: null,
  address: null,
  email: "softwaresergiom@gmail.com",
  registry: null,
};

// Confirm retention, processing bases, providers and any commercial terms before enabling indexing.
export const legalContentReviewed = false;
export const legalReviewDate = "16 de septiembre de 2026";
export const informationLinks = [
  { href: "/cartas", label: "Colección de cartas" },
  { href: "/instalar", label: "Instalar en el móvil" },
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
