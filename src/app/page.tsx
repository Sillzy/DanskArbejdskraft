'use client';

import { motion } from 'framer-motion';
import {
  Send,
  ShieldCheck,
  Timer,
  ImagePlus,
  Download,
  Bolt,
  Shield,
  Users,
  ArrowRight,
  ClipboardCheck,
  Mail,
  BarChart3,
  FileStack,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="bg-light-bg">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center text-white">
        {/* 50% transparent background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/BaggrundDanskarbejdsKraft.png"
            alt=""
            fill
            priority
            className="object-cover opacity-50"
          />
          {/* blue tint */}
          <div className="absolute inset-0 bg-blue-500/50 mix-blend-multiply" />
        </div>

        {/* gradient overlay stays above the image */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 to-black/40" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-bold md:text-7xl"
          >
            Bemanding til byggebranchen
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mb-6 max-w-3xl text-lg md:text-xl"
          >
            Vores prioriteter er vores folk og jeres projekt. Vores virksomhed er bygget på kvalitet og et netværk af dygtige specialister på tværs af flere byggeområder.
          </motion.p>

          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact/office"
              className="rounded-lg bg-blue-500 px-8 py-4 font-semibold text-white hover:bg-blue-600"
            >
              Find arbejdskraft
            </Link>
            <Link
              href="/signup?next=/dashboard/onboarding"
              className="rounded-lg border border-white/80 px-8 py-4 text-white hover:bg-white/10"
            >
              Bliv medarbejder
            </Link>
          </div>

          <div className="mb-8 flex justify-center gap-3">
            <div className="stat-badge">
              <Bolt className="mr-2 h-4 w-4" />
              Hurtig opstart
            </div>
            <div className="stat-badge">100 % compliance</div>
            <div className="stat-badge">Tilgængelighed</div>
          </div>

          <ArrowRight className="mx-auto h-5 w-5 animate-bounce" />
        </div>
      </section>

      {/* Services — cards now link to their pages */}
      <section id="services" className="bg-[#F5F8FF] py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-4 text-center text-4xl font-bold text-navy"
          >
            Find dine ydelser
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mx-auto mb-12 max-w-3xl text-center text-gray-700"
          >
            Vi er en byggevirksomhed, der beskæftiger vores dygtige arbejdsstyrke.
            Vores drift understøttes af en intern platform, der forbinder sømløst
            med vores teams på pladsen. Ved at styre tidsregistrering, dokumentation
            og fotohåndtering internt og undgå tredjepartssystemer effektiviserer vi
            informationsflowet, kan let levere de ønskede data til kunder og bevarer
            fuld kontrol over GDPR-overholdelse og cybersikkerhed.
          </motion.p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/services/temporary-staff"
              className="service-card block bg-white text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <motion.div whileHover={{ scale: 1.02 }} className="p-6">
                <Bolt className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Midlertidigt personale</h3>
                <p className="text-gray-600">Godkendte medarbejdere til dine opgaver.</p>
              </motion.div>
            </Link>

            <Link
              href="/services/project-based-crews"
              className="service-card block bg-white text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <motion.div whileHover={{ scale: 1.02 }} className="p-6">
                <Users className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Projektbaserede hold</h3>
                <p className="text-gray-600">
                  Teams tilpasset jeres projektfaser, fx fundament, murerarbejde m.m.
                </p>
              </motion.div>
            </Link>

            <Link
              href="/services/subcontractor"
              className="service-card block bg-white text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <motion.div whileHover={{ scale: 1.02 }} className="p-6">
                <Shield className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Entrepriseprojekt</h3>
                <p className="text-gray-600">
                  Én partner, der koordinerer flere fag. Kontakt os for at planlægge leverancen.
                </p>
              </motion.div>
            </Link>

            <Link
              href="/services/smart-time-registration"
              className="service-card block bg-white text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <motion.div whileHover={{ scale: 1.02 }} className="p-6">
                <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Smart tidsregistrering</h3>
                <p className="text-gray-600">
                  Arbejdstid, godkendelser og eksport — præcist og enkelt.
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Fields — richer cards with blue buttons + learn more */}
      <section id="fields" className="relative overflow-hidden bg-light-bg py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-4xl font-bold text-navy"
          >
            Udforsk vores fagområder
          </motion.h2>

          <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Beton & fundament', href: '/industries/concrete-foundation', desc: 'Forskalling, armering og udstøbning til plader og bærende konstruktioner.' },
              { label: 'Murerarbejde', href: '/industries/bricklaying', desc: 'Murerteams til facader, blokarbejde, renovering m.m.' },
              { label: 'Truckførere', href: '/industries/forklift-drivers', desc: 'Certificerede operatører til pladslogistik og materialeflyt.' },
              { label: 'Maskinførere til tungt materiel', href: '/industries/heavy-machinery-operators', desc: 'Dygtige operatører til gravemaskiner, læssemaskiner og kraner.' },
              { label: 'VVS-montør', href: '/industries/plumber', desc: 'Fra råinstallation til færdig VVS i bolig og erhverv.' },
              { label: 'Tagdækker', href: '/industries/roofer', desc: 'Montering og reparation af membran-, tegl- og metalsystemer.' },
              { label: 'Svejsere', href: '/industries/welder', desc: 'Certificerede svejsere til stålkonstruktioner og on-site fabrikation.' },
              { label: 'Stålmontør', href: '/industries/ironworker', desc: 'Stålmontage, armeringsbinding og rigning.' },
              { label: 'Tømrerarbejde', href: '/industries/carpentry', desc: 'Råhus, finish og specialsnedkeri til inde og ude.' },
              { label: 'Isolatør', href: '/industries/insulation-installer', desc: 'Termisk og akustisk isolering til vægge, tage og rør.' },
            ].map((f, i) => (
              <motion.article
                key={f.href}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-navy">{f.label}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={f.href}
                    className="text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
                  >
                    Læs mere
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Solutions — same color, NO gradient */}
      <section className="bg-[#F5F8FF] py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-14 text-center text-4xl font-bold tracking-tight text-navy"
          >
            Vores løsninger
          </motion.h2>

          <ol className="relative grid gap-8 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[calc(16px+0.5rem)] top-10 h-[calc(100%-2.5rem)] w-[2px] bg-gradient-to-b from-blue-200 to-transparent md:hidden" />

            {[
              { step: '1', title: 'Forespørgsel', desc: 'Send jeres projektforespørgsel og tidsplan.', Icon: Send },
              { step: '2', title: 'Matchning', desc: 'Vi udvælger godkendte medarbejdere eller hele hold.', Icon: Users },
              { step: '3', title: 'Onboarding', desc: 'Kontrakter og compliance håndteres før opstart på pladsen.', Icon: ShieldCheck },
              { step: '4', title: 'Registrér', desc: 'Medarbejdere indsender timer.', Icon: Timer },
              { step: '5', title: 'Dokumentation', desc: 'Valgfri foto-upload af fremdrift.', Icon: ImagePlus },
              { step: '6', title: 'Eksport', desc: 'Anmod om statistikker for projekter eller pladser.', Icon: Download },
            ].map(({ step, title, desc, Icon }, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
                  {step}
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{desc}</p>
                <span className="absolute inset-x-6 bottom-0 block h-[3px] translate-y-1 rounded-t-full bg-gradient-to-r from-transparent via-blue-200/60 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Project & Site Report — “Request Report” */}
      <section id="insights" className="bg-[#F5F8FF] py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 md:grid-cols-2">
          {/* LEFT */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-navy"
            >
              <span className="text-blue-600">Til kunder: </span> Projektrapport
            </motion.h2>

            <p className="mb-8 text-gray-700">
              Få et klart, delbart øjebliksbillede af jeres projekt: mandskab, tidsforbrug, omkostninger,
              fotos og dokumentation — samlet ét sted.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-xl bg-white p-4 ring-1 ring-blue-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-navy">Overblik over arbejdskraft</div>
                  <div className="text-sm text-gray-600">Efter projekt eller byggeplads — hurtigt overblik.</div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-4 ring-1 ring-blue-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-navy">Omkostnings- og timestatistik</div>
                  <div className="text-sm text-gray-600">Præcise trends for tid og forbrug.</div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-4 ring-1 ring-blue-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
                  <FileStack className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-navy">Pakke med fotos og dokumenter</div>
                  <div className="text-sm text-gray-600">Alt samlet og klar til deling.</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: request report form → /api/contact */}
          <motion.form
            whileHover={{ scale: 1.01 }}
            action="/api/contact"
            method="POST"
            className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            {/* Honeypot */}
            <input type="text" name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Hidden name to satisfy API */}
            <input type="hidden" name="name" value="Website Project Report Request" />

            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-900">Anmod om rapport</h3>
              <p className="mt-2 text-sm text-gray-600">
                Modtag en samlet PDF med indblik i projekt eller byggeplads.
              </p>
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Arbejdsmail"
                required
                className="w-full rounded-lg border p-3 pl-10 text-sm placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <FileStack className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="company"
                placeholder="Projektnavn"
                className="w-full rounded-lg border p-3 pl-10 text-sm placeholder:text-gray-400"
              />
            </div>

            {/* message required for API */}
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Hvad skal rapporten indeholde (pladser, datoer, omfang)?"
              className="w-full rounded-lg border p-3 text-sm placeholder:text-gray-400"
            />

            <button
              type="submit"
              className="group w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition"
            >
              <span className="inline-flex items-center">
                Send din anmodning
                <Download className="ml-2 h-4 w-4 transition" />
              </span>
            </button>

            <p className="text-xs text-gray-500">Vi respekterer dit privatliv.</p>
          </motion.form>
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-light-bg py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-3xl font-bold text-navy"
          >
            Succeshistorier
          </motion.h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="service-card bg-white">
              <p className="mb-4 italic text-gray-700">
                &quot;Dansk Arbejdskraft samlede et fuldt betonhold på 12 på under 7 dage, så vores
                byggeplads holdt tidsplanen.&quot;
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <strong>Peter — Projektleder</strong>
                </div>
                <div className="flex space-x-4 text-sm text-blue-600">
                  <span>Bemanding på 7 dage</span>
                  <span>100 % compliance</span>
                </div>
              </div>
            </div>

            <div className="service-card bg-white">
              <p className="mb-4 italic text-gray-700">
                &quot;Tids­godkendelser tog sekunder, og fotopakken hjalp os med at godkende faser uden
                forsinkelser.&quot;
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <strong>Sofia — Pladsleder</strong>
                </div>
                <div className="flex space-x-4 text-sm text-blue-600">
                  <span>Opstart samme dag</span>
                  <span>Gennemsigtige timer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/signup?next=/dashboard/onboarding"
              className="inline-block rounded-lg bg-blue-500 px-8 py-3 text-white hover:bg-blue-600"
            >
              Bliv medarbejder
            </Link>
          </div>
        </div>
      </section>

      {/* Simple CTA — “Find your skilled worker today” */}
      <section className="relative overflow-hidden bg-[#F6F8FF] py-20 md:py-28">
        {/* decorative gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4">
          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-center text-3xl font-extrabold leading-tight text-slate-900 md:text-left md:text-5xl">
            Skaler jeres team med dygtige medarbejdere
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600 md:text-left">
            Kom i kontakt med os og find dygtige medarbejdere til jeres næste projekt. Vi fokuserer på kvalitet,
            gennemsigtighed, hastighed og compliance — så I kan fokusere på leverancen.
          </p>

          {/* Main grid */}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left: Form → /api/contact */}
            <div className="order-2 md:order-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Find din dygtige medarbejder i dag</h3>
                  <p className="mt-1 text-sm text-slate-600">Få en professionel til jeres næste projekt</p>
                </div>

                <form action="/api/contact" method="POST" className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {/* Honeypot */}
                  <input type="text" name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />

                  <label className="sr-only" htmlFor="first">Fornavn</label>
                  <input
                    id="first"
                    name="name"             /* use as the required 'name' field */
                    placeholder="Fornavn"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                  />

                  <label className="sr-only" htmlFor="last">Efternavn</label>
                  <input
                    id="last"
                    name="last"
                    placeholder="Efternavn"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                  />

                  <label className="sr-only" htmlFor="company">Virksomhedsnavn</label>
                  <input
                    id="company"
                    name="company"
                    placeholder="Virksomhedsnavn"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 md:col-span-2"
                  />

                  <label className="sr-only" htmlFor="email">Arbejdsmail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Arbejdsmail"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 md:col-span-2"
                  />

                  <label className="sr-only" htmlFor="phone">Telefonnummer</label>
                  <input
                    id="phone"
                    name="phone"
                    placeholder="Telefonnummer"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 md:col-span-2"
                  />

                  <label className="sr-only" htmlFor="position">Stillingstype</label>
                  <input
                    id="position"
                    name="position"
                    placeholder="Stillingstype (fx operatør, betonarbejder)"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 md:col-span-2"
                  />

                  <label className="sr-only" htmlFor="details">Projektdetaljer</label>
                  <textarea
                    id="details"
                    name="message"         /* required by API */
                    required
                    placeholder="Projektdetaljer og specifikke krav…"
                    className="h-28 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2 md:col-span-2"
                  />

                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 md:col-span-2"
                  >
                    Bestil mandskab <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Benefits + Testimonials */}
            <div className="order-1 space-y-6 md:order-2">
              <div className="rounded-2xl bg-white/70 p-6 ring-1 ring-slate-200 backdrop-blur-sm">
                <h4 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-slate-800">
                  Vi er et sikkert valg
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Forhåndsgodkendte kandidater', '10+ års erfaring', 'Adgang til talent', '100 % succesrate'].map(
                    (label) => (
                      <div key={label} className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                          {label}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white/70 p-6 ring-1 ring-slate-200 backdrop-blur-sm">
                <h4 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-slate-800">
                  Tillid fra kunder
                </h4>

                <div className="space-y-4">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100">
                    <p className="text-sm italic text-slate-700">
                      &quot;Leverede et hold på 10+, uden problemer og processen var smidig og fremragende.&quot;
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                        B
                      </div>
                      <div>
                        <div className="font-semibold">Thomas</div>
                        <div>Formand</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4 ring-1 ring-blue-100">
                    <p className="text-sm italic text-slate-700">
                      &quot;Deres kandidater sparede os for måneders arbejde. 100 % succesrate.&quot;
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                        T
                      </div>
                      <div>
                        <div className="font-semibold">Peter</div>
                        <div>Projektleder</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Testimonials */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
