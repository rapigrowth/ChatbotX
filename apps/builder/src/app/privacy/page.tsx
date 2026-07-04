import type { Metadata } from "next"
import { getTenantSettings } from "@/features/tenant/utils"

export const metadata: Metadata = {
  title: "Política de privacidad",
}

const sections = [
  {
    title: "Datos que recopilamos",
    body: "Recopilamos la información necesaria para crear y administrar tu cuenta, operar tus espacios de trabajo, enviar mensajes y prestar soporte. Esto puede incluir nombre, correo electrónico, datos de uso, integraciones configuradas y el contenido que decides cargar o conectar al servicio.",
  },
  {
    title: "Cómo usamos tus datos",
    body: "Usamos tus datos para prestar el servicio, autenticar usuarios, procesar comunicaciones, mejorar la plataforma, prevenir abuso, cumplir obligaciones legales y responder solicitudes de soporte.",
  },
  {
    title: "Integraciones y terceros",
    body: "Si conectas canales o proveedores externos, compartimos únicamente los datos necesarios para que esas integraciones funcionen. Cada proveedor puede tratar datos conforme a sus propias políticas.",
  },
  {
    title: "Conservación y seguridad",
    body: "Conservamos la información mientras sea necesaria para prestar el servicio o cumplir obligaciones legales. Aplicamos medidas técnicas y organizativas razonables para protegerla frente a accesos no autorizados, pérdida o uso indebido.",
  },
  {
    title: "Tus derechos",
    body: "Puedes solicitar acceso, corrección, eliminación o exportación de tus datos, sujeto a las leyes aplicables y a las necesidades legítimas de operación, seguridad y cumplimiento.",
  },
  {
    title: "Cambios a esta política",
    body: "Podemos actualizar esta política cuando cambie el servicio o la normativa aplicable. La versión publicada en esta página será la vigente.",
  },
]

export default async function PrivacyPage() {
  const { name } = await getTenantSettings()

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 py-12 text-foreground md:py-16">
      <p className="font-medium text-muted-foreground text-sm">
        Última actualización: 4 de julio de 2026
      </p>
      <h1 className="mt-3 font-semibold text-4xl tracking-tight">
        Política de privacidad
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Esta política explica cómo {name} recopila, usa y protege la información
        cuando utilizas nuestra plataforma.
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-semibold text-2xl">{section.title}</h2>
            <p className="mt-3 text-muted-foreground leading-7">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-lg border bg-card p-5">
        <h2 className="font-semibold text-2xl">Contacto</h2>
        <p className="mt-3 text-muted-foreground leading-7">
          Para ejercer tus derechos o hacer preguntas sobre privacidad, contacta
          al administrador de la plataforma.
        </p>
      </section>
    </main>
  )
}
