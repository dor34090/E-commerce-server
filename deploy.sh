echo "Deploying server to GCP \n"

#Returns a list of all GCP deployment versions
gcloud_list() {
    #the result of gcloud is not a very usable array
    #hence the new array
    local gcloud="$(gcloud app versions list)"
    local array=()
    for word in $gcloud
    do 
        array+=($word)
    done 
    echo "${array[@]}"
}

#Deletes unnecessary deployments that are not utilized
delete_version() {
        local array=($@)
        for ((i=0; i< ${#array[@]}; i++)); do
            if [[${array[$i]}== *"0.00"*]]; then
                local version=${array[$i-1]}
                local command="gcloud -q app versions delete $version"
                eval $command
            fi
        done
}

#Execute functions
list=$(gcloud_list)
delete_version $list

#Deploy to google cloud provider
gcloud app deploy --stop-previous-version