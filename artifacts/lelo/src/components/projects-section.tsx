"use client"

import { useEffect, useState } from "react"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { ArrowLeft, Bath, BedDouble, Loader2, MapPin, Maximize } from "lucide-react"
import {
  apiFetch,
  formatPrice,
  listingTypeLabels,
  propertyTypeLabels,
  type Property,
} from "@/lib/api"
import project1 from "../assets/project-1.png"
import project2 from "../assets/project-2.png"
import project3 from "../assets/project-3.png"
import project4 from "../assets/project-4.png"

const FALLBACK_IMAGES = [project1, project2, project3, project4]

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function ProjectsSection() {
  const [properties, setProperties] = useState<Property[] | null>(null)

  useEffect(() => {
    apiFetch<{ properties: Property[] }>("/api/properties?limit=6")
      .then((d) => setProperties(d.properties))
      .catch(() => setProperties([]))
  }, [])

  if (properties != null && properties.length === 0) return null

  return (
    <section id="projects" className="py-20 px-4 bg-background overflow-hidden">
      <div
        className="container mx-auto"
        dir="rtl"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center mb-16">
          <motion.div
            className="inline-block mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span
              className="text-sm uppercase tracking-[0.3em] font-semibold"
              style={{ color: "var(--gold)" }}
            >
              Our Developments
            </span>
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--gold-light)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            مشاريعنا اللي بنبنيها بنفسنا
          </motion.h2>
          <motion.p
            className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
إحنا في باشاك بنطوّر وبنبني مشاريعنا بأنفسنا في قلب التجمع الخامس — كل وحدة من تصميمنا وتنفيذنا وتسليمنا.
          </motion.p>
        </div>

        {properties == null ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {properties.slice(0, 4).map((p, i) => (
                <FeaturedCard key={p.id} property={p} index={i} />
              ))}
            </div>
            <motion.div
              className="mt-12 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                href="/properties"
                data-testid="link-view-more-properties"
                className="group inline-flex items-center gap-3 px-8 py-3 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: "var(--gold)",
                  color: "var(--gold-light)",
                  background: "rgba(212, 175, 55, 0.05)",
                }}
              >
                <span>عرض المزيد</span>
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}

function FeaturedCard({ property, index }: { property: Property; index: number }) {
  const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8 }}
      className="group relative rounded-2xl overflow-hidden border bg-card cursor-pointer"
      style={{ borderColor: "var(--border)" }}
    >
      <Link
        href={`/properties/${property.id}`}
        aria-label={`عرض تفاصيل ${property.title}`}
        className="absolute inset-0 z-[1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
      />
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={property.mainImageUrl || fallback}
          alt={property.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = fallback
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-4 right-4">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-black"
            style={{ background: "var(--gold)" }}
          >
            {listingTypeLabels[property.listingType] ?? property.listingType}
          </span>
        </div>
        <div className="absolute bottom-0 right-0 left-0 p-6">
          <h3
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--gold-light)" }}
          >
            {property.title}
          </h3>
          {property.location && (
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <MapPin className="h-4 w-4" style={{ color: "var(--gold)" }} />
              <span>{property.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 relative">
        <p className="text-foreground/90 mb-4 font-medium">
          {propertyTypeLabels[property.type] ?? property.type}
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ background: "rgba(212, 175, 55, 0.06)" }}
          >
            <BedDouble className="h-4 w-4" style={{ color: "var(--gold)" }} />
            <span className="text-sm text-foreground/80">
              {property.bedrooms != null ? `${property.bedrooms} غرف` : "—"}
            </span>
          </div>
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ background: "rgba(212, 175, 55, 0.06)" }}
          >
            <Maximize className="h-4 w-4" style={{ color: "var(--gold)" }} />
            <span className="text-sm text-foreground/80">
              {property.area != null ? `${property.area} م²` : "—"}
            </span>
          </div>
          {property.bathrooms != null && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg col-span-2"
              style={{ background: "rgba(212, 175, 55, 0.06)" }}
            >
              <Bath className="h-4 w-4" style={{ color: "var(--gold)" }} />
              <span className="text-sm text-foreground/80">
                {property.bathrooms} حمامات
              </span>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-sm" style={{ color: "var(--gold-light)" }}>
            {formatPrice(property.price)}
          </span>
          <span
            className="flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-3"
            style={{ color: "var(--gold)" }}
          >
            التفاصيل
            <ArrowLeft className="h-4 w-4" />
          </span>
        </div>
      </div>
    </motion.article>
  )
}
