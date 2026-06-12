interface HeaderProps {
  onNewBoard: () => void;
}

export function Header({ onNewBoard }: HeaderProps) {
  return (
    <header>
      <h1>Distributed</h1>
      <span>
        <span className="prime">
          <i className="fa fa-star"></i>
          Prime Directive
          <span>
            <blockquote>
              <p>
                Regardless of what we discover, we understand and truly believe
                that everyone did the best job they could, given what was known
                at the time, their skills and abilities, the resources
                available, and the situation at hand
              </p>
              <footer>In Project Retrospectives, Norm Kerth</footer>
            </blockquote>
          </span>
        </span>
        <a
          className="header-icon"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/funretro/distributed"
          aria-label="Github repo"
        >
          <i className="fa fa-github"></i>
        </a>
        <button className="first" onClick={onNewBoard}>
          New board
        </button>
      </span>
    </header>
  );
}
