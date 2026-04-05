import type { Country } from '../models/countries/Country';
import { requestWithAuth } from './httpClient';

export class CountriesService {
    public static getAllCountries(): Promise<Array<Country>> {
        return requestWithAuth<Array<Country>>('/Countries');
    }
}
