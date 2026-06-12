interface HomeProps {
  onNewBoard: () => void;
}

export function Home({ onNewBoard }: HomeProps) {
  return (
    <div className="home">
      <section>
        <h1>
          <small>Distributed</small>
        </h1>

        <button onClick={onNewBoard}>NEW BOARD</button>
      </section>
    </div>
  );
}
