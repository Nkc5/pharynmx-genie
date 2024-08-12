sudo docker rm $(sudo docker stop $(sudo docker ps -a -q --filter ancestor=server-nestjs_app --format="{{.ID}}"))
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q --filter ancestor=saas-front --format="{{.ID}}"))
sudo docker rmi server-nestjs_app
sudo docker rmi saas-front
cd client
sudo docker build . -t saas-front
sudo docker run -it --rm -dp 4000:3000 saas-front
cd ../server
sudo docker compose up -d



# ajaygupta9504@gmail.com      Foxman$%&9900