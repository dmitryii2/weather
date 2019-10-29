<?php

namespace App\Jobs;

use App\City;
use App\History;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CollectWeatherHistory implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $page;

    /**
     * CollectWeatherHistory constructor.
     * @param int $page
     */
    public function __construct($page = 1)
    {
        $this->page = $page;
    }

    public function getCities($p) {

        echo 'page: ' . $p . PHP_EOL;
        if ($p > 30) return;

        $html = file_get_contents("https://ru.meteotrend.com/forecast/ru/?letter={$p}");
        $dom = new \DOMDocument;
        $htmlWithUtf8 = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html;
        $dom->loadHTML($htmlWithUtf8);
        $links = $dom->getElementsByTagName('a');
        $script = explode('ajicities_t=', $dom->getElementsByTagName('script')[0]->textContent)[1];
        $script = explode(',ajicities_w', $script)[0];
        $tempsByCities = json_decode($script);
        foreach($links as $k => $link) {
            $province = $link->getAttribute('title');
            $name = $link->textContent;
            $city = City::firstOrCreate([
                'province' => $province,
                'name' => $name,
            ]);
            History::create([
                'city_id' => $city->id,
                'ts' => time(),
                'temp' => $tempsByCities[$k],
            ]);
        }

        sleep(2);
        $this->getCities($p + 1);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->getCities($this->page);
    }
}
