$(document).ready(function () {
    // Edit Groups Button Click
    $('.edit-groups-btn').on('click', function () {
        const videoId = $(this).data('video-id');
        // console.log('Edit Groups for Video ID:', videoId);

        // Fetch available groups and selected groups for this video
        $.ajax({
            url: `/admin/get-groups/${videoId}`,
            method: 'GET',
            success: function (data) {
                // console.log('Groups Data:', data);
                showGroupSelectionModal(data.groups, data.selectedGroups, videoId);
            },
            error: function (error) {
                console.error('Error Fetching Groups:', error);
            }
        });
    });

    // Show Group Selection Modal
    function showGroupSelectionModal(groups, selectedGroups, videoId) {
        let modalContent = `
            <div class="modal fade" id="groupSelectionModal" tabindex="-1" aria-labelledby="groupSelectionModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="groupSelectionModalLabel">Edit Groups</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="list-group">
                                ${groups.map(group => `
                                    <li class="list-group-item">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="group-${group.id}" value="${group.id}" ${selectedGroups.includes(group.id) ? 'checked' : ''}>
                                            <label class="form-check-label" for="group-${group.id}">
                                                ${group.name}
                                            </label>
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="saveGroupsBtn">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append Modal to Body
        $('body').append(modalContent);

        // Show Modal
        $('#groupSelectionModal').modal('show');

        // Save Groups Button Click
        $('#saveGroupsBtn').on('click', function () {
            const selectedGroups = [];
            $('.form-check-input:checked').each(function () {
                selectedGroups.push($(this).val());
            });

            // console.log('Selected Groups:', selectedGroups);

            // Save Selected Groups
            $.ajax({
                url: `/admin/update-groups/${videoId}`,
                method: 'POST',
                data: { groups: selectedGroups },
                success: function (response) {
                    // console.log('Groups Updated:', response);
                    $('#groupSelectionModal').modal('hide');
                    location.reload(); // Refresh the page
                },
                error: function (error) {
                    console.error('Error Updating Groups:', error);
                }
            });
        });
    }
});

