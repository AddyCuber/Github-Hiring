import Link from "next/link"
import { SponsoredSlot } from "@/types"

type Props = {
  slot: SponsoredSlot
}

export function SponsoredSlotCard({ slot }: Props) {
  return (
    <div className="border-2 border-primary bg-primary-muted p-8 flex flex-col md:flex-row items-center gap-10 retro-shadow-orange">
      <div className="flex-1">
        <div className="inline-block px-2 py-0.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest mb-4">
          EXTERNAL PARTNER
        </div>
        <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-3 italic">{slot.sponsor_name}</h3>
        {slot.description && (
          <p className="text-foreground/80 font-bold leading-snug max-w-2xl text-sm uppercase tracking-tight">
            {slot.description}
          </p>
        )}
      </div>
      <Link
        href={slot.cta_url}
        target="_blank"
        className="retro-button retro-button-primary shrink-0 px-10 py-4 text-xs uppercase tracking-widest"
      >
        {slot.cta_label}
      </Link>
    </div>
  )
}
