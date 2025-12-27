interface FieldInfoProps {
  message?: string;
}

export function FieldInfo({ message }: FieldInfoProps) {
  if (!message) return null;

  return <p className="text-sm font-medium text-destructive/80">{message}</p>;
}
