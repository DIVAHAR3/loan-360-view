export default function CardHeading({ emoji, title }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#0B7A54] to-[#4D7A9E] text-base text-white">
        {emoji}
      </span>
      <span className="bg-gradient-to-br from-[#0B7A54] to-[#4D7A9E] bg-clip-text font-bold text-transparent drop-shadow-[0_1px_2px_rgba(15,28,23,0.12)]">
        {title}
      </span>
    </span>
  )
}
