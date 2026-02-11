<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $baseUrl;

    protected bool $enabled;

    protected int $timeout;

    protected array $retryConfig;

    public function __construct()
    {
        $this->baseUrl = config('whatsapp.api_url', 'http://localhost:3050/api');
        $this->enabled = config('whatsapp.enabled', true);
        $this->timeout = config('whatsapp.timeout', 30);
        $this->retryConfig = config('whatsapp.retry', [
            'enabled' => false,
            'times' => 3,
            'delay' => 1000,
        ]);
    }

    /**
     * Send text message to WhatsApp number
     */
    public function sendMessage(string $to, string $message): array
    {
        if (! $this->enabled) {
            Log::info('WhatsApp disabled, skipping message', ['to' => $to]);

            return ['success' => false, 'message' => 'WhatsApp disabled'];
        }

        try {
            $phone = $this->formatPhoneNumber($to);

            $request = Http::timeout($this->timeout);

            if ($this->retryConfig['enabled']) {
                $request->retry($this->retryConfig['times'], $this->retryConfig['delay']);
            }

            $response = $request->post("{$this->baseUrl}/send-message", [
                'to' => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent', [
                    'to' => $this->maskPhone($phone),
                    'message' => $this->maskMessage($message),
                ]);

                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('WhatsApp API error', [
                'to' => $this->maskPhone($phone),
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp exception', [
                'to' => $this->maskPhone($to),
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send message with media (image, video, document, etc)
     */
    public function sendMessageWithMedia(
        string $to,
        string $message,
        string $mediaUrl,
        string $mediaType = 'image'
    ): array {
        if (! $this->enabled) {
            Log::info('WhatsApp disabled, skipping media message', ['to' => $to]);

            return ['success' => false, 'message' => 'WhatsApp disabled'];
        }

        try {
            $phone = $this->formatPhoneNumber($to);

            $request = Http::timeout($this->timeout);

            if ($this->retryConfig['enabled']) {
                $request->retry($this->retryConfig['times'], $this->retryConfig['delay']);
            }

            $response = $request->post("{$this->baseUrl}/send-message", [
                'to' => $phone,
                'message' => $message,
                'media_url' => $mediaUrl,
                'media_type' => $mediaType,
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp media message sent', [
                    'to' => $this->maskPhone($phone),
                    'media_type' => $mediaType,
                    'message_snippet' => $this->maskMessage($message),
                ]);

                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('WhatsApp media API error', [
                'to' => $this->maskPhone($phone),
                'status' => $response->status(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send media message',
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp media exception', [
                'to' => $this->maskPhone($to),
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get WhatsApp connection status
     */
    public function getStatus(): array
    {
        try {
            $response = Http::timeout(5)
                ->get("{$this->baseUrl}/status");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get status',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format phone number to WhatsApp format
     * Removes all non-numeric characters and ensures proper format
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0, replace with 62 (Indonesia)
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        // If doesn't start with country code, add 62
        if (! str_starts_with($phone, '62')) {
            $phone = '62'.$phone;
        }

        return $phone;
    }

    /**
     * Check if WhatsApp is enabled
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * Mask phone number for privacy
     */
    protected function maskPhone(string $phone): string
    {
        if (strlen($phone) < 8) {
            return '********';
        }

        return substr($phone, 0, 4).'****'.substr($phone, -4);
    }

    /**
     * Mask message content for privacy
     */
    protected function maskMessage(string $message): string
    {
        if (strlen($message) < 10) {
            return '***';
        }

        return substr($message, 0, 3).'...'.substr($message, -3);
    }
}
