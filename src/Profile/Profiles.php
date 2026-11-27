<?php

namespace App\Profile;

/**
 * Profils de l'appli (un par joueur), lus dans GW2_PROFILES :
 * « slug:Nom » séparés par des virgules, dans l'ordre d'affichage.
 */
final readonly class Profiles
{
    /** @param array<string, Profile> $profiles indexés par slug */
    private function __construct(private array $profiles)
    {
    }

    public static function fromString(string $value): self
    {
        $profiles = [];
        foreach (array_filter(array_map(trim(...), explode(',', $value))) as $entry) {
            [$slug, $name] = array_map(trim(...), explode(':', $entry, 2)) + [1 => ''];
            if (1 !== preg_match('/^[a-z0-9-]+$/', $slug)) {
                throw new \InvalidArgumentException(\sprintf('GW2_PROFILES : slug invalide « %s » (minuscules, chiffres et tirets).', $slug));
            }
            if ('' === $name) {
                throw new \InvalidArgumentException(\sprintf('GW2_PROFILES : nom manquant pour « %s » (format slug:Nom).', $slug));
            }
            if (isset($profiles[$slug])) {
                throw new \InvalidArgumentException(\sprintf('GW2_PROFILES : profil « %s » en double.', $slug));
            }
            $profiles[$slug] = new Profile($slug, $name);
        }

        if ([] === $profiles) {
            throw new \InvalidArgumentException('GW2_PROFILES : aucun profil configuré.');
        }

        return new self($profiles);
    }

    /** @return list<Profile> */
    public function all(): array
    {
        return array_values($this->profiles);
    }

    public function get(string $slug): ?Profile
    {
        return $this->profiles[$slug] ?? null;
    }
}
