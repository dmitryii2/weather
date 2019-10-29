<?php
/**
 * Created by PhpStorm.
 * User: dmitry
 * Date: 29.10.19
 * Time: 17:02
 */

namespace App\Http\Controllers;


use App\City;
use App\History;

class HistoryController extends Controller
{

    public function index() {
        request()->validate([
            'province' => 'required',
            'name' => 'required',
        ]);

        $data = request()->all();
        $city = City::where($data)->first();
        if (!$city) return response()->json([
            'error' => 'City not found'
        ], 404);
        return History::where(['city_id' => $city->id])->get();
    }

}
