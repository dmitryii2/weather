<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CollectWeatherHistory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'weather:collect';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Collecting weather history';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        \App\Jobs\CollectWeatherHistory::dispatch();
    }
}
