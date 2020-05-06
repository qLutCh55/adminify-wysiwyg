<template>
    <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
    >
        <v-card style="min-height: 100%;">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="closeFileSelect">
                    <v-icon>$mdiClose</v-icon>
                </v-btn>
                <v-toolbar-title>Files</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-container grid-list-sm fluid>
                <v-layout row wrap>
                    <v-flex
                        xs12
                        v-if="objectFiles.length"
                    >
                        <h2
                            class="display-1 mb-3 mt-3"
                        >
                            Associated Files
                        </h2>
                        <v-card>
                            <v-card-text class="pa-3">
                                <v-simple-table>
                                    <template v-slot:default>
                                        <thead>
                                        <tr>
                                            <th class="text-center"></th>
                                            <th class="text-center">Name</th>
                                            <th class="text-center">Size</th>
                                            <th class="text-center">Extension</th>
                                            <th class="text-center">Public</th>
                                            <th class="text-center">Details</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr
                                            v-for="(file, index) in objectFiles"
                                            :key="index"
                                            @click="selectFile(file)"
                                            class="pointer"
                                        >
                                            <td class="text-center">
                                                <v-icon size="30">{{ getFileIcon(file) }}</v-icon>
                                            </td>
                                            <td class="text-center">
                                                {{ file.basename }}
                                            </td>
                                            <td class="text-center">
                                                {{ humanFileSize(file.size) }}
                                            </td>
                                            <td class="text-center">
                                                {{ file.extension }}
                                            </td>
                                            <td class="text-center">
                                                <template v-if="file.public">
                                                    <v-icon color="success">
                                                        $mdiCheckDecagram
                                                    </v-icon>
                                                </template>
                                                <template v-else>
                                                    <v-icon color="error">
                                                        $mdiCloseCircle
                                                    </v-icon>
                                                </template>
                                            </td>
                                            <td class="text-center">
                                                Uploaded at: {{ file.created_at|date }} <br>
                                                {{ file.created_at|fromNow }}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>
                            </v-card-text>
                        </v-card>
                    </v-flex>

                    <v-flex xs12>
                        <h2
                            class="display-1 mb-3 mt-3"
                        >
                            Global Library
                        </h2>

                        <v-upload
                            url="/files/upload"
                            accept="*"
                            role="file"
                            fileType="file"
                            :model="model"
                            :modelId="modelId"
                            @uploaded="uploadedFile"
                            @error="alertError"
                            multiple
                        >
                            Drag your file<br> or click to browse
                        </v-upload>
                    </v-flex>
                    <v-flex xs12>
                        <v-slide-y-transition mode="out-in">
                            <v-card>
                                <v-card-title dark class="primary white--text pa-3">

                                    <div class="text--white text-uppercase subtitle-1 font-weight-medium pa-2">
                                        {{ files.length }}
                                        <span v-if="files.length === 1">Result</span>
                                        <span v-else>Results</span>
                                    </div>

                                    <v-spacer></v-spacer>

                                    <v-text-field
                                        v-model="searchQuery"
                                        placeholder="Search"
                                        hide-details
                                        :autocomplete="'new-password'"
                                        solo
                                        :disabled="fetchingFiles"
                                    ></v-text-field>
                                </v-card-title>
                                <v-card-text class="pa-3">
                                    <v-layout wrap>
                                        <v-flex xs12>
                                            <v-simple-table>
                                                <template v-slot:default>
                                                    <thead>
                                                    <tr>
                                                        <th class="text-center"></th>
                                                        <th class="text-center">Name</th>
                                                        <th class="text-center">Size</th>
                                                        <th class="text-center">Extension</th>
                                                        <th class="text-center">Public</th>
                                                        <th class="text-center">Details</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    <tr
                                                        v-for="(file, index) in files"
                                                        :key="index"
                                                        @click="selectFile(file)"
                                                        class="pointer"
                                                    >
                                                        <td class="text-center">
                                                            <v-icon size="30">{{ getFileIcon(file) }}</v-icon>
                                                        </td>
                                                        <td class="text-center">
                                                            {{ file.basename }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{ humanFileSize(file.size) }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{ file.extension }}
                                                        </td>
                                                        <td class="text-center">
                                                            <template v-if="file.public">
                                                                <v-icon color="success">
                                                                    $mdiCheckDecagram
                                                                </v-icon>
                                                            </template>
                                                            <template v-else>
                                                                <v-icon color="error">
                                                                    $mdiCloseCircle
                                                                </v-icon>
                                                            </template>
                                                        </td>
                                                        <td class="text-center">
                                                            Uploaded at: {{ file.created_at|date }} <br>
                                                            {{ file.created_at|fromNow }}
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </template>
                                            </v-simple-table>
                                        </v-flex>
                                        <v-flex xs12 class="text-center mt-2" v-if="noFilesFound && !fetchingFiles">
                                            <p class="red--text">Could not find any files...</p>
                                        </v-flex>
                                        <v-flex
                                            xs12
                                            class="text-center mt-2"
                                            v-if="thereIsMoreFiles"
                                        >
                                            <v-btn
                                                @click="loadMoreFiles"
                                                :disabled="fetchingFiles"
                                                color="primary"
                                            >
                                                Load More
                                            </v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-slide-y-transition>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {
                dialog: true,
                fetchingFiles: true,
                page: 0,
                objectFiles: [],
                files: [],
                searchQuery: '',
                timeout: null,
                noFilesFound: false,
                thereIsMoreFiles: false,
            }
        },
        props: {
            'model': {
                default: null,
            },
            'modelId': {
                default: null,
            },
        },
        watch: {
            'searchQuery'() {
                this.fetchFilesDelayed();
            },
        },
        name: 'Editor-File-Select-Dialog',
        mounted() {
            if (this.model && this.modelId) {
                this.fetchObjectFiles();
            }

            window.axios.post('/files/searchPaginated?page=' + this.page).then(response => {
                if (response.data.files.total > 0) {
                    this.page++;
                    this.fetchingFiles = false;
                    this.files = response.data.files.data;
                    this.thereIsMoreFiles = true;
                } else {
                    this.fetchingFiles = false;
                    this.thereIsMoreFiles = false;
                    this.noFilesFound = false;
                }
            });
        },
        methods: {
            fetchObjectFiles() {
                window.axios.post('/files/associations', {
                    model: this.model,
                    modelId: this.modelId
                }).then(response => {
                    this.objectFiles = response.data.files;
                })
            },
            closeFileSelect() {
                this.$emit('close');
            },
            selectFile(file) {
                this.$emit('select', file);
            },
            fetchFilesDelayed() {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.files = [];
                    this.page = 1;
                    this.noFilesFound = false;
                    this.loadMoreFiles();
                }, 500);
            },
            loadMoreFiles() {
                this.fetchingFiles = true;
                window.axios.post('/files/searchPaginated?page=' + this.page, {searchQuery: this.searchQuery}).then(response => {
                    if (response.data.files.total > 0) {
                        this.page++;
                        this.fetchingFiles = false;
                        this.files = this.files.concat(response.data.files.data);
                        this.thereIsMoreFiles = response.data.files.total > 18;
                    } else {
                        this.fetchingFiles = false;
                        this.thereIsMoreFiles = false;
                        this.noFilesFound = true;
                    }
                });
            },

            uploadedFile(response) {
                this.selectFile(response.file);
                this.$toasted.show('File uploaded!', {
                    theme: "default",
                    position: "top-center",
                    duration: 2000
                });
            },
            alertError(message) {
                this.$toasted.show(message, {
                    theme: "error",
                    position: "top-center",
                    duration: 3500
                });
            }
        },
    }
</script>
<style lang="scss">
    .v-responsive-icon {
        max-width: 250px;
        width: 100%;
        margin: 0 auto;
        position: relative;

        i {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            font-size: 120px !important;
            background-color: transparent;
            border-radius: 50%;
        }
    }

    .v-responsive-icon:before {
        content: "";
        display: block;
        padding-top: 100%;
    }
</style>
