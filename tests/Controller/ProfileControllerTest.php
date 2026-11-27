<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ProfileControllerTest extends WebTestCase
{
    public function testListeLesProfilsDeLaConfiguration(): void
    {
        $client = self::createClient();
        $client->request('GET', '/api/profiles');

        self::assertResponseIsSuccessful();
        self::assertSame(
            [['slug' => 'alice', 'name' => 'Alice'], ['slug' => 'bob', 'name' => 'Bob']],
            json_decode((string) $client->getResponse()->getContent(), true),
        );
    }
}
