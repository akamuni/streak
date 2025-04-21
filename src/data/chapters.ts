export interface Chapter {
  id: string
  title: string
}

export const books: { name: string; count: number }[] = [
  { name: '1 Nephi', count: 22 },
  { name: '2 Nephi', count: 33 },
  { name: 'Jacob', count: 7 },
  { name: 'Enos', count: 1 },
  { name: 'Jarom', count: 1 },
  { name: 'Omni', count: 1 },
  { name: 'Words of Mormon', count: 1 },
  { name: 'Mosiah', count: 29 },
  { name: 'Alma', count: 63 },
  { name: 'Helaman', count: 16 },
  { name: '3 Nephi', count: 30 },
  { name: '4 Nephi', count: 1 },
  { name: 'Mormon', count: 9 },
  { name: 'Ether', count: 15 },
  { name: 'Moroni', count: 10 },
];

export const chapters: Chapter[] = books.flatMap(book =>
  Array.from({ length: book.count }, (_, i) => ({
    id: `${book.name}-${i + 1}`,
    title: `${book.name} ${i + 1}`,
  }))
);
