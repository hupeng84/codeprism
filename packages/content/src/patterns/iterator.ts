import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* iteratorGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const playlist = { id: 'playlist', name: 'Playlist', type: 'Aggregate', state: { songs: ['Song A', 'Song B', 'Song C'] }, position: { x: 400, y: 50 }, status: 'idle' as const };
  const iterator = { id: 'iterator', name: 'SongIterator', type: 'Iterator', state: { currentIndex: 0, songs: ['Song A', 'Song B', 'Song C'] }, position: { x: 400, y: 150 }, status: 'idle' as const };
  const song1 = { id: 'song1', name: 'Song A', type: 'Song', state: {}, position: { x: 200, y: 280 }, status: 'idle' as const };
  const song2 = { id: 'song2', name: 'Song B', type: 'Song', state: {}, position: { x: 400, y: 280 }, status: 'idle' as const };
  const song3 = { id: 'song3', name: 'Song C', type: 'Song', state: {}, position: { x: 600, y: 280 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [playlist, iterator, song1, song2, song3], messages: [] }, description: 'Playlist aggregate with iterator ready to traverse', highlightLine: 1 };
  yield { step: 2, state: { objects: [{ ...playlist, status: 'active' }, iterator, song1, song2, song3], messages: [{ from: 'playlist', to: 'iterator', method: 'getIterator()', args: [], status: 'pending' as const }] }, description: 'Client requests iterator from playlist', highlightLine: 2 };
  yield { step: 3, state: { objects: [playlist, { ...iterator, status: 'active' }, song1, song2, song3], messages: [{ from: 'playlist', to: 'iterator', method: 'getIterator()', args: [], status: 'complete' as const }] }, description: 'Playlist creates and returns iterator', highlightLine: 3 };
  yield { step: 4, state: { objects: [playlist, { ...iterator, state: { ...iterator.state, currentIndex: 0 }, status: 'highlighted' }, song1, song2, song3], messages: [{ from: 'iterator', to: 'iterator', method: 'hasNext()', args: [], status: 'pending' as const }] }, description: 'Iterator checks hasNext() - returns true', highlightLine: 7 };
  yield { step: 5, state: { objects: [playlist, iterator, { ...song1, status: 'active' }, song2, song3], messages: [{ from: 'iterator', to: 'song1', method: 'next()', args: [], status: 'pending' as const }] }, description: 'Iterator calls next() to get Song A', highlightLine: 8 };
  yield { step: 6, state: { objects: [playlist, { ...iterator, state: { ...iterator.state, currentIndex: 1 } }, song1, song2, song3], messages: [{ from: 'iterator', to: 'song1', method: 'next()', args: [], status: 'complete' as const }] }, description: 'Song A retrieved, index advances to 1', highlightLine: 9 };
  yield { step: 7, state: { objects: [playlist, { ...iterator, state: { ...iterator.state, currentIndex: 1 } }, song1, { ...song2, status: 'active' }, song3], messages: [{ from: 'iterator', to: 'song2', method: 'next()', args: [], status: 'pending' as const }] }, description: 'Iterator gets Song B', highlightLine: 8 };
  yield { step: 8, state: { objects: [playlist, { ...iterator, state: { ...iterator.state, currentIndex: 2 } }, song1, song2, song3], messages: [{ from: 'iterator', to: 'song2', method: 'next()', args: [], status: 'complete' as const }] }, description: 'Song B retrieved, index advances to 2 - iteration complete', highlightLine: 9 };
}

export const iteratorCode = `interface SongIterator {
  hasNext(): boolean;
  next(): string;
  current(): string;
}

class Playlist implements Aggregate {
  private songs: string[] = [];

  addSong(song: string): void {
    this.songs.push(song);
  }

  getIterator(): SongIterator {
    return new PlaylistIterator(this.songs);
  }

  getSongCount(): number {
    return this.songs.length;
  }
}

class PlaylistIterator implements SongIterator {
  private position: number = 0;

  constructor(private songs: string[]) {}

  hasNext(): boolean {
    return this.position < this.songs.length;
  }

  next(): string {
    const song = this.songs[this.position];
    this.position++;
    return song;
  }

  current(): string {
    return this.songs[this.position];
  }
}

// Client usage
const playlist = new Playlist();
playlist.addSong('Song A');
playlist.addSong('Song B');
playlist.addSong('Song C');

const iterator = playlist.getIterator();
while (iterator.hasNext()) {
  console.log(iterator.next());
}`;

export const iteratorCodeLines = [
  "interface SongIterator {",
  "  hasNext(): boolean;",
  "  next(): string;",
  "  current(): string;",
  "}",
  "",
  "class Playlist implements Aggregate {",
  "  private songs: string[] = [];",
  "",
  "  addSong(song: string): void {",
  "    this.songs.push(song);",
  "  }",
  "",
  "  getIterator(): SongIterator {",
  "    return new PlaylistIterator(this.songs);",
  "  }",
  "",
  "  getSongCount(): number {",
  "    return this.songs.length;",
  "  }",
  "}",
  "",
  "class PlaylistIterator implements SongIterator {",
  "  private position: number = 0;",
  "",
  "  constructor(private songs: string[]) {}",
  "",
  "  hasNext(): boolean {",
  "    return this.position < this.songs.length;",
  "  }",
  "",
  "  next(): string {",
  "    const song = this.songs[this.position];",
  "    this.position++;",
  "    return song;",
  "  }",
  "",
  "  current(): string {",
  "    return this.songs[this.position];",
  "  }",
  "}",
  "",
  "// Client usage",
  "const playlist = new Playlist();",
  "playlist.addSong('Song A');",
  "playlist.addSong('Song B');",
  "playlist.addSong('Song C');",
  "",
  "const iterator = playlist.getIterator();",
  "while (iterator.hasNext()) {",
  "  console.log(iterator.next());",
  "}",
];

const iteratorDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Iterator",
      name: "Iterator",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "hasNext", params: "", returnType: "boolean" },
        { visibility: "+", name: "next", params: "", returnType: "Object" },
      ],
      position: { x: 150, y: 50 },
    },
    {
      id: "ConcreteIterator",
      name: "ConcreteIterator",
      attributes: [],
      methods: [
        { visibility: "+", name: "hasNext", params: "", returnType: "boolean" },
        { visibility: "+", name: "next", params: "", returnType: "Object" },
      ],
      position: { x: 150, y: 250 },
    },
    {
      id: "Aggregate",
      name: "Aggregate",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "createIterator", params: "", returnType: "Iterator" },
      ],
      position: { x: 650, y: 50 },
    },
    {
      id: "ConcreteAggregate",
      name: "ConcreteAggregate",
      attributes: [],
      methods: [
        { visibility: "+", name: "createIterator", params: "", returnType: "Iterator" },
      ],
      position: { x: 650, y: 250 },
    },
  ],
  relationships: [
    { from: "ConcreteIterator", to: "Iterator", type: "implements" },
    { from: "ConcreteAggregate", to: "Aggregate", type: "implements" },
    { from: "ConcreteAggregate", to: "ConcreteIterator", type: "dependency", label: "creates" },
  ],
};

export const iteratorContent = {
  id: "iterator",
  slug: "iterator",
  title: "",
  titleKey: "content.patterns.iterator.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.iterator.desc",
  defaultInput: undefined,
  code: iteratorCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  diagram: iteratorDiagram,
  icon: "🔢",
  codeExamples: {
    typescript: {
      code: `interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

class Playlist {
  private songs: string[] = [];

  addSong(song: string): void { this.songs.push(song); }

  createIterator(): Iterator<string> {
    return new PlaylistIterator(this.songs);
  }
}

class PlaylistIterator implements Iterator<string> {
  private position = 0;

  constructor(private songs: string[]) {}

  hasNext(): boolean { return this.position < this.songs.length; }

  next(): string { return this.songs[this.position++]; }
}

const playlist = new Playlist();
playlist.addSong("Song A");
playlist.addSong("Song B");
playlist.addSong("Song C");

const iter = playlist.createIterator();
while (iter.hasNext()) {
  console.log(iter.next());
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct {
  const char** items;
  int size;
  int position;
} Iterator;

int iterator_has_next(Iterator* it) { return it->position < it->size; }
const char* iterator_next(Iterator* it) { return it->items[it->position++]; }

int main(void) {
  const char* songs[] = {"Song A", "Song B", "Song C"};
  Iterator iter = { songs, 3, 0 };
  while (iterator_has_next(&iter)) {
    printf("%s\\n", iterator_next(&iter));
  }
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <vector>
#include <memory>

template<typename T>
class Iterator {
public:
  virtual bool hasNext() = 0;
  virtual T next() = 0;
  virtual ~Iterator() = default;
};

template<typename T>
class Playlist {
  std::vector<T> songs;
public:
  void addSong(const T& song) { songs.push_back(song); }
  std::unique_ptr<Iterator<T>> createIterator() {
    return std::make_unique<PlaylistIterator<T>>(songs);
  }
private:
  template<typename U>
  class PlaylistIterator : public Iterator<U> {
    std::vector<U> items;
    int position = 0;
  public:
    PlaylistIterator(const std::vector<U>& v) : items(v) {}
    bool hasNext() override { return position < items.size(); }
    U next() override { return items[position++]; }
  };
};

int main() {
  Playlist<std::string> playlist;
  playlist.addSong("Song A");
  playlist.addSong("Song B");
  auto iter = playlist.createIterator();
  while (iter->hasNext()) {
    std::cout << iter->next() << std::endl;
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class Iterator:
    def has_next(self):
        raise NotImplementedError

    def next(self):
        raise NotImplementedError

class PlaylistIterator(Iterator):
    def __init__(self, songs):
        self.songs = songs
        self.position = 0

    def has_next(self):
        return self.position < len(self.songs)

    def next(self):
        song = self.songs[self.position]
        self.position += 1
        return song

class Playlist:
    def __init__(self):
        self.songs = []

    def add_song(self, song):
        self.songs.append(song)

    def create_iterator(self):
        return PlaylistIterator(self.songs)

playlist = Playlist()
playlist.add_song("Song A")
playlist.add_song("Song B")
playlist.add_song("Song C")

iter = playlist.create_iterator()
while iter.has_next():
    print(iter.next())`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Iterator {
    type Item;
    fn has_next(&self) -> bool;
    fn next(&mut self) -> Option<Self::Item>;
}

struct PlaylistIterator {
    songs: Vec<String>,
    position: usize,
}

impl Iterator for PlaylistIterator {
    type Item = String;
    fn has_next(&self) -> bool { self.position < self.songs.len() }
    fn next(&mut self) -> Option<String> {
        if self.has_next() {
            Some(self.songs[self.position].clone())
        } else {
            None
        }
    }
}

fn main() {
    let songs = vec!["Song A".to_string(), "Song B".to_string()];
    let mut iter = PlaylistIterator { songs, position: 0 };
    while let Some(song) = iter.next() {
        println!("{}", song);
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Iterator interface {
    HasNext() bool
    Next() string
}

type PlaylistIterator struct {
    songs   []string
    position int
}

func (i *PlaylistIterator) HasNext() bool {
    return i.position < len(i.songs)
}

func (i *PlaylistIterator) Next() string {
    song := i.songs[i.position]
    i.position++
    return song
}

type Playlist struct {
    songs []string
}

func (p *Playlist) AddSong(song string) { p.songs = append(p.songs, song) }
func (p *Playlist) CreateIterator() Iterator {
    return &PlaylistIterator{songs: p.songs}
}

func main() {
    playlist := &Playlist{}
    playlist.AddSong("Song A")
    playlist.AddSong("Song B")
    iter := playlist.CreateIterator()
    for iter.HasNext() {
        fmt.Println(iter.Next())
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `import java.util.*;

public class Main {
    interface Iterator<T> {
        boolean hasNext();
        T next();
    }

    static class Playlist implements Iterable<String> {
        private List<String> songs = new ArrayList<>();
        public void addSong(String song) { songs.add(song); }
        public Iterator<String> iterator() {
            return new Iterator<String>() {
                private int position = 0;
                public boolean hasNext() { return position < songs.size(); }
                public String next() { return songs.get(position++); }
            };
        }
    }

    public static void main(String[] args) {
        Playlist playlist = new Playlist();
        playlist.addSong("Song A");
        playlist.addSong("Song B");
        Iterator<String> iter = playlist.iterator();
        while (iter.hasNext()) {
            System.out.println(iter.next());
        }
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — anchored to systems the learner
  // can recognize from day-to-day engineering work.
  scenarios: [
    {
      id: "java-iterable",
      i18nKey: "content.patterns.iterator.scenarios.java-iterable",
      domain: "library",
      icon: "☕",
      reference: "Java SDK, C# IEnumerable, Python __iter__",
    },
    {
      id: "react-iterator",
      i18nKey: "content.patterns.iterator.scenarios.react-iterator",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React, Redux selectors, RxJS streams",
    },
    {
      id: "db-cursor",
      i18nKey: "content.patterns.iterator.scenarios.db-cursor",
      domain: "database",
      icon: "🗄️",
      reference: "MongoDB cursor, JDBC ResultSet, PostgreSQL FETCH",
      codeSnippet: {
        language: "typescript",
        code: `// MongoDB cursor — iterates millions of docs without loading all into memory
const cursor = db.collection("users").find({ age: { $gt: 18 } });
for await (const doc of cursor) {
  console.log(doc.name);
}`,
      },
    },
  ] satisfies Scenario[],
};
