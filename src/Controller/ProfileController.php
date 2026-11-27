<?php

namespace App\Controller;

use App\Profile\Profile;
use App\Profile\Profiles;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class ProfileController
{
    /** Profils proposés sur l'écran d'accueil. */
    #[Route('/api/profiles', methods: ['GET'])]
    public function __invoke(Profiles $profiles): JsonResponse
    {
        return new JsonResponse(array_map(
            static fn (Profile $p): array => ['slug' => $p->slug, 'name' => $p->name],
            $profiles->all(),
        ));
    }
}
