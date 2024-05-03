export function* characterGenerator(allowedTypes, minLevel, maxLevel) { while (true) {
    const typeChar = Math.floor(Math.random() * allowedTypes.length);
    const levelChar = Math.floor(Math.random() * ((maxLevel + 1) - minLevel) + minLevel);

    yield new allowedTypes[typeChar](levelChar);
  }
}

export function generateTeam(allowedTypes, minLevel, maxLevel, characterCount) {
  const team = [];
  const char = characterGenerator(allowedTypes, minLevel, maxLevel);

  for (let i = 0; i < characterCount; i += 1) {
    team.push(char.next().value);
  }

  return team;
}
