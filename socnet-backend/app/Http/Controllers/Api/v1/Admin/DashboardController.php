<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Api\v1\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(): JsonResponse
    {
        $last7Days = Carbon::today()->subDays(6);

        // існуючі метрики
        $totalUsers = User::count();
        $totalPosts = Post::count();
        $totalComments = Comment::count();

        $registrations = User::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', $last7Days)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $postsTimeline = Post::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as posts_count'))
            ->where('created_at', '>=', $last7Days)
            ->groupBy('date')->orderBy('date')->get()->keyBy('date');

        $commentsTimeline = Comment::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as comments_count'))
            ->where('created_at', '>=', $last7Days)
            ->groupBy('date')->orderBy('date')->get()->keyBy('date');

        $contentActivity = [];
        for ($i = 0; $i < 7; $i++) {
            $dateString = clone $last7Days;
            $dateString->addDays($i);
            $formattedDate = $dateString->format('Y-m-d');

            $contentActivity[] = [
                'date' => $formattedDate,
                'posts' => $postsTimeline->get($formattedDate)->posts_count ?? 0,
                'comments' => $commentsTimeline->get($formattedDate)->comments_count ?? 0,
            ];
        }

        // хто зараз онлайн (активні за останні 5 хвилин)
        $onlineUsers = User::select('id', 'username', 'first_name', 'last_name', 'avatar')
            ->where('last_seen_at', '>=', Carbon::now()->subMinutes(5))
            ->orderBy('last_seen_at', 'desc')
            ->limit(10)
            ->get();


        $onlineCount = User::where('last_seen_at', '>=', Carbon::now()->subMinutes(5))->count();

        // метрики сервера
        $cpuLoad = function_exists('sys_getloadavg') ? sys_getloadavg()[0] : 0;

        // використання памяті
        $memoryUsage = memory_get_usage(true) / 1024 / 1024; // МБ

        // вільне місце на диску
        $diskFree = disk_free_space("/") / 1024 / 1024 / 1024; // ГБ
        $diskTotal = disk_total_space("/") / 1024 / 1024 / 1024; // ГБ
        $diskUsagePercent = $diskTotal > 0 ? round((($diskTotal - $diskFree) / $diskTotal) * 100) : 0;

        return response()->json([
            'summary' => [
                'users' => $totalUsers,
                'posts' => $totalPosts,
                'comments' => $totalComments,
            ],
            'charts' => [
                'registrations' => $registrations,
                'activity' => $contentActivity
            ],
            'server' => [
                'cpu_load' => round($cpuLoad, 2),
                'memory_mb' => round($memoryUsage, 2),
                'disk_percent' => $diskUsagePercent,
                'disk_free_gb' => round($diskFree, 1),
                'php_version' => phpversion(),
            ],
            'realtime' => [
                'online_count' => $onlineCount,
                'users' => $onlineUsers
            ]
        ]);
    }
}