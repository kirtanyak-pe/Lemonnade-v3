import { BrandLogo, type Brand } from '../components/BrandLogo'

const brands: { brand: Brand; label: string }[] = [
  { brand: 'lemonn', label: '🍋 Lemonn' },
  { brand: 'zing', label: '⭐ Zing' },
]

/** The 4 Figma variants (Brand × isFull), then every size. */
export function BrandLogoVariants() {
  return (
    <>
      <section>
        <h2>Brand × isFull</h2>
        <div className="bg-row">
          {brands.flatMap(({ brand, label }) =>
            (['full', 'icon'] as const).map((variant) => (
              <figure key={brand + variant} className="bg-frame logo-frame">
                <figcaption>Brand={label}, isFull={variant === 'full' ? 'True' : 'False'}</figcaption>
                <BrandLogo brand={brand} variant={variant} size={48} />
              </figure>
            )),
          )}
        </div>
      </section>
      <section>
        <h2>Sizes (height)</h2>
        <div className="bg-row">
          {([24, 32, 40, 48] as const).map((size) => (
            <figure key={size} className="bg-frame logo-frame">
              <figcaption>size={size}</figcaption>
              <div className="logo-pair">
                <BrandLogo brand="lemonn" size={size} />
                <BrandLogo brand="zing" size={size} />
              </div>
            </figure>
          ))}
        </div>
      </section>
    </>
  )
}
