import User from "./src/models/user.model.js"

export const socketHandler = async (io) => {
    io.on('connection', (socket) => {
        socket.on('identity', async ({ userId }) => {

            const user = await User.findByIdAndUpdate(
                {
                    _id: userId
                },
                {
                    socketId: socket.id,
                    isOnline: true
                },
                {
                    new: true
                }
            )
        })

        socket.on('deliveryLocationUpdate', async ({ deliveryBoy, customer, lat, lng }) => {
            const deliveryBoyD = await User.findByIdAndUpdate(deliveryBoy,
                {
                    location: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    socketId: socket.id,
                    isOnline: true
                }
            )

            // ✅ find customer socket
            const customerD = await User.findById(customer);

            if (customerD?.socketId) {
                io.to(customerD.socketId).emit("deliveryLocationUpdated", {
                    lat,
                    lng
                });
            }
        })


        socket.on('disconnect', async () => {
            await User.findOneAndUpdate(
                {
                    socketId: socket.id
                },
                {
                    socketId: null,
                    isOnline: false
                }
            )
        })

    })
}
