<?php

namespace App\Traits;

trait IpMasker
{
    /**
     * Mask the given IP address for privacy in logs.
     * Example: 192.168.1.15 -> 192.168.1.xxx
     */
    protected function maskIp(?string $ip): string
    {
        if (!$ip) {
            return 'unknown';
        }

        // Handle IPv4
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            if (count($parts) === 4) {
                return $parts[0] . '.' . $parts[1] . '.' . $parts[2] . '.xxx';
            }
        }

        // Handle IPv6
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $ip);
            if (count($parts) > 1) {
                array_pop($parts);
                return implode(':', $parts) . ':xxxx';
            }
        }

        return 'xxx.xxx.xxx.xxx';
    }
}
