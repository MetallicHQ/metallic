export type Region =
  | 'atl' // Atlanta, Georgia
  | 'iad' // Ashburn, Virginia
  | 'lhr' // London, United Kingdom
  | 'ord' // Chicago, Illinois
  | 'phx' // Phoenix, Arizona
  | 'sea' // Seattle, Washington
  | 'sjc'; // San Jose, California

export type Instance =
  | '2x4' // 2 CPUs, 4GB RAM
  | '4x8' // 4 CPUs, 8GB RAM
  | '8x16' // 8 CPUs, 16GB RAM
  | '16x32' // 16 CPUs, 32GB RAM
  | 'a10' // 8 CPUs, 32GB RAM, A10 GPU
  | 'a100-40gb' // 8 CPUs, 32GB RAM, A100 GPU
  | 'a100-80gb'; // 8 CPUs, 32GB RAM, A100 GPU
