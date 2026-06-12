interface BoardContextProps {
  context: string;
  onChange: (context: string) => void;
}

export function BoardContext({ context, onChange }: BoardContextProps) {
  return (
    <input
      id="board-context"
      className="board-context"
      value={context}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Set the context of the retrospective here..."
      aria-label="Board context"
    />
  );
}
