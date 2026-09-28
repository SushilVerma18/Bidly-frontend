import { Heart, ArrowUpRight, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

export const fallbackImages = [
  'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=85'
]

export function imageFor(auction, index=0) { return auction?.images?.find(x => x.isPrimary)?.imageUrl || auction?.images?.[0]?.imageUrl || fallbackImages[index % fallbackImages.length] }

function formatMoney(value) { return value == null ? '—' : `₹${Number(value).toLocaleString('en-IN')}` }

export default function AuctionCard({ auction, index=0, featured=false }) {
  const live = auction.status === 'LIVE'
  return <Link to={`/auctions/${auction.id}`} className={`group block ${featured ? 'md:col-span-2' : ''}`}>
    <div className={`relative overflow-hidden rounded-[28px] bg-[#eee] ${featured ? 'aspect-[16/9]' : 'aspect-[.88]'} shadow-card`}>
      <img src={imageFor(auction,index)} alt={auction.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
      <div className="absolute left-4 top-4 flex gap-2">
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] backdrop-blur">{live ? <span className="inline-flex items-center gap-1.5"><Radio size={11} className="text-[#ff42ad]"/> Live now</span> : auction.status}</span>
      </div>
      <button onClick={e => e.preventDefault()} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-[#ff42ad] hover:text-white transition"><Heart size={16}/></button>
      <div className="absolute inset-x-5 bottom-5 text-white">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/65">{auction.category?.name || 'Collectible'}</p><h3 className="mt-1 font-display text-xl font-bold tracking-[-.04em]">{auction.title}</h3></div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black transition group-hover:bg-[#ff42ad] group-hover:text-white"><ArrowUpRight size={17}/></div>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-3 text-xs"><span className="text-white/60">Current bid</span><strong className="text-base">{formatMoney(auction.currentHighestBid || auction.startingPrice)}</strong></div>
      </div>
    </div>
  </Link>
}
