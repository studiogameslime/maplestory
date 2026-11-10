import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { resolveAsset, type AssetKind } from './assets'
import { useApp } from './state'
import './asset-image.css'

type Props = {
  kind: AssetKind
  id: number | string
  label: string
  className?: string
}

export function AssetImage({ kind, id, label, className = '' }: Props) {
  const { t } = useApp()
  const [failed, setFailed] = useState<string>()
  const asset = resolveAsset(kind, id)
  if (asset.status === 'approved' && asset.src !== failed) {
    return (
      <img
        className={className}
        src={asset.src}
        alt={label}
        title={asset.provenance === 'original'
          ? t('Original illustration by MapleCompanion', 'איור מקורי של MapleCompanion')
          : asset.attribution}
        loading="lazy"
        onError={() => setFailed(asset.src)}
      />
    )
  }

  const unavailable = t('Image unavailable', 'תמונה לא זמינה')
  const detail = asset.status === 'unavailable' && asset.reason === 'rights-unconfirmed'
    ? t('Game artwork awaits reuse permission.', 'השימוש באיור המשחק ממתין להרשאה.')
    : unavailable
  return (
    <span
      className={'asset-unavailable ' + className}
      role="img"
      aria-label={[label, detail].filter(Boolean).join(' · ')}
      title={detail}
    >
      <ImageOff aria-hidden="true" size={16} />
      <small>{unavailable}</small>
    </span>
  )
}
