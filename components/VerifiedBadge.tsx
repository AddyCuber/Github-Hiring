import { Check } from "lucide-react"

export function VerifiedBadge() {
  return (
    <div className="flex h-5 w-5 items-center justify-center border border-foreground bg-primary shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
      <Check className="h-3 w-3 text-white stroke-[4]" />
    </div>
  )
}
