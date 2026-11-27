<?php

namespace App\Tests\Profile;

use App\Profile\Profile;
use App\Profile\Profiles;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ProfilesTest extends TestCase
{
    public function testLitLesProfilsDansLOrdre(): void
    {
        $profiles = Profiles::fromString('alice:Alice, bob:Bob Martin');

        self::assertEquals(
            [new Profile('alice', 'Alice'), new Profile('bob', 'Bob Martin')],
            $profiles->all(),
        );
    }

    public function testRetrouveUnProfilParSonSlug(): void
    {
        $profiles = Profiles::fromString('alice:Alice,bob:Bob');

        self::assertEquals(new Profile('bob', 'Bob'), $profiles->get('bob'));
        self::assertNull($profiles->get('carole'));
    }

    /** @return iterable<string, array{string}> */
    public static function configurationsInvalides(): iterable
    {
        yield 'vide' => [''];
        yield 'sans nom' => ['alice'];
        yield 'nom vide' => ['alice:'];
        yield 'slug avec majuscule' => ['Alice:Alice'];
        yield 'slug avec espace' => ['ali ce:Alice'];
        yield 'slug en double' => ['alice:Alice,alice:Autre'];
    }

    #[DataProvider('configurationsInvalides')]
    public function testRefuseUneConfigurationInvalide(string $value): void
    {
        $this->expectException(\InvalidArgumentException::class);

        Profiles::fromString($value);
    }
}
