<?php

namespace App\Profile;

final readonly class Profile
{
    public function __construct(
        public string $slug,
        public string $name,
    ) {
    }
}
