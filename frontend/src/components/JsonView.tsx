import React, {useMemo} from 'react';

export default function JsonView({ data }: { data: unknown }) {
  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return <pre className="json">{text}</pre>;
}
