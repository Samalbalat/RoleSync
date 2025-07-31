import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

class CampaignService {

    getAllCampaigns() {
        return axios.get(`${BASE_URL}/campaigns`);
    }

    getCampaignById(id) {
        return axios.get(`${BASE_URL}/campaigns/search/${id}`);
    }
}
export default new CampaignService();