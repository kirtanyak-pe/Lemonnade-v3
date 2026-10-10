{/* Kill Switch — the kit's regression example: L1 cards + stats, L2 settings, a confirm sheet over it, a result. */}
<Flow name="L3 kit · Kill switch example">
  <Screen name="K1 Positions">
    <Actionbar title="Portfolio" actions={[{ icon: "settings", label: "F&O settings" }]} bottom={<Tabs appearance="underline" items={["Positions", "Orders"]} />} />
    <Row gap={12}>
      <Card grow><KeyValue label="NIFTY 50" value="25,312.40" change={0.42} /></Card>
      <Card grow><KeyValue label="SENSEX" value="82,890.95" change={0.38} /></Card>
    </Row>
    <Card gap={12}>
      <KeyValue label="Current value" value="₹47,022.25" valueStyle="Heading/24" change={{ value: 2801.75, unit: "currency", percent: 6.34, size: "lg" }} />
      <Stats card={false} items={[["Invested", "₹44,220.50"], ["Open positions", "3"]]} />
    </Card>
    <ListCell variant="card" label="Pause F&O trading" description="Kill Switch blocks new trades for today" iconLeft="pause" iconRight />
    <Section title="Open positions (3)" action="View all">
      <Card clickable padding="none" footer={[<Button>Exit now</Button>]}>
        <Row justify="between"><Text style="Label/14">NIFTY 14 OCT 25300 CE</Text><PriceChange value={1961.25} unit="currency" /></Row>
        <Row justify="between"><Text style="Label/12" color="secondary">Buy · 75 qty · Avg ₹142.30</Text><Text style="Label/12" color="secondary">LTP ₹168.45</Text></Row>
      </Card>
    </Section>
    <BottomNavbar value="portfolio" />
  </Screen>
  <Screen name="K2 Settings">
    <Actionbar title="Kill switch" back />
    <Aerobar type="warning" heading="Pauses all F&O trading" paragraph="Open orders are cancelled and positions are exited at market price." />
    <Section title="Segments">
      <ListCell label="Futures" description="Index and stock futures" trailing="switch:on" />
      <ListCell label="Options" description="Index and stock options" trailing="switch:on" />
      <ListCell label="Commodities" trailing="switch" />
    </Section>
    <Section title="Duration">
      <ListCell variant="card" label="Until end of today" trailing="radio:on" selected />
      <ListCell variant="card" label="Until I turn it off" trailing="radio" />
    </Section>
    <ButtonGroup><Button>Pause trading</Button></ButtonGroup>
  </Screen>
  <Screen name="K3 Confirm" base="K2 Settings">
    <BottomSheet heading="Pause F&O trading?" description="This takes effect immediately." footer={<ButtonGroup direction="horizontal"><Button>Pause</Button><Button variant="secondary">Cancel</Button></ButtonGroup>}>
      <ListCell label="Segments" trailing="Futures, Options" />
      <ListCell label="Until" trailing="Today, 3:30 PM" />
      <ListCell label="Open positions" trailing="3 will be exited" />
    </BottomSheet>
  </Screen>
  <Screen name="K4 Paused">
    <Actionbar title="Kill switch" back />
    <EmptyState title="F&O trading paused" description="You can resume trading tomorrow from 9:00 AM." />
    <ButtonGroup><Button>Go to portfolio</Button></ButtonGroup>
  </Screen>
</Flow>
