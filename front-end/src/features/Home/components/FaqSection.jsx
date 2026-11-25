import { ArrowUpRight, ChevronDown, MessageCircleQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import H2 from "../../../components/H2";

const questions = [
  {
    question: "¿Cómo puedo realizar un pedido?",
    answer: <>Explora el catálogo, abre un producto y agrégalo al carrito. Inicia sesión, revisa las cantidades y completa la dirección y el teléfono de envío antes de confirmar tu pedido.</>,
  },
  {
    question: "¿Dónde puedo ver el estado de mi pedido?",
    answer: <>Entra a <Link to="/cuenta/ordenes" className="font-medium text-amber-900 underline">Mis órdenes</Link> y pulsa «Ver seguimiento». Allí encontrarás la etapa actual, desde que recibimos el pedido hasta la entrega. La campana de notificaciones también te avisa cuando cambia el estado.</>,
  },
  {
    question: "¿Puedo guardar más de una dirección de envío?",
    answer: <>Sí. En <Link to="/cuenta" className="font-medium text-amber-900 underline">Mi cuenta</Link> puedes guardar direcciones con su teléfono de contacto y elegir una preferente. Al comprar podrás seleccionar otro destino o editar los datos solo para ese pedido.</>,
  },
  {
    question: "¿Hasta cuándo está disponible una oferta?",
    answer: <>Cada oferta muestra una cuenta regresiva. El descuento estará disponible dentro de las fechas indicadas y mientras haya stock. Antes de confirmar la compra se vuelve a comprobar el precio vigente.</>,
  },
  {
    question: "¿Qué hago si olvidé mi contraseña?",
    answer: <>Usa la opción <Link to="/recuperar-cuenta" className="font-medium text-amber-900 underline">Recuperar cuenta</Link> e ingresa el correo con el que te registraste. Sigue las instrucciones del enlace de recuperación para crear una contraseña nueva.</>,
  },
];

const FaqSection = () => (
  <section id="preguntas-frecuentes" aria-labelledby="faq-title" className="scroll-mt-24 border-t border-stone-200 px-5 py-14 lg:py-20">
    <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-16">
      <div>
        <span className="mb-5 inline-flex rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800"><MessageCircleQuestion className="size-6" aria-hidden="true" /></span>
        <div id="faq-title"><H2>Comprar, sin dudas</H2></div>
        <p className="mt-4 text-sm leading-7 text-stone-600">Resolvemos las preguntas más frecuentes para acompañarte en cada paso de tu compra.</p>
        <Link to="/cuenta/ordenes" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-900">Consultar mis pedidos <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </div>
      <div className="space-y-3 lg:col-span-2">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group rounded-2xl border border-stone-200 bg-white open:border-amber-300 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-2xl p-5 font-medium text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 sm:p-6 [&::-webkit-details-marker]:hidden">
              {question}<ChevronDown className="size-5 shrink-0 text-amber-800 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="px-5 pb-6 text-sm leading-7 text-stone-600 sm:px-6">{answer}</div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
