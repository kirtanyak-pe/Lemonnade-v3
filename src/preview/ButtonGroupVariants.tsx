import { Button } from '../components/Button'
import { ButtonGroup } from '../components/ButtonGroup'

// Mirrors the Figma frame: vertical (primary on top) and horizontal (primary on the right), each with and without the scroll indicator.
export function ButtonGroupVariants() {
  return (
    <>
      {[false, true].map((scrolled) => (
        <section key={String(scrolled)}>
          <h2>Scroll indicator = {scrolled ? 'on' : 'off'}</h2>
          <div className="bg-row">
            <figure className="bg-frame">
              <figcaption>Direction = ↓ Vertical</figcaption>
              <ButtonGroup direction="vertical" scrollIndicator={scrolled} aria-label="Order actions">
                <Button size="lg">Label</Button>
                <Button size="lg" variant="secondary">Label</Button>
              </ButtonGroup>
            </figure>
            <figure className="bg-frame">
              <figcaption>Direction = → Horizontal</figcaption>
              <ButtonGroup direction="horizontal" scrollIndicator={scrolled} aria-label="Order actions">
                <Button size="lg" variant="secondary">Label</Button>
                <Button size="lg">Label</Button>
              </ButtonGroup>
            </figure>
          </div>
        </section>
      ))}
    </>
  )
}
