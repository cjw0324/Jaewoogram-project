package com.example.demo.domain.chat.controller;

import com.example.demo.domain.chat.controller.dto.ChatRoomSummaryResponse;
import com.example.demo.domain.chat.controller.dto.CreateGroupRoomRequest;
import com.example.demo.domain.chat.controller.dto.InviteUserRequest;
import com.example.demo.domain.chat.entity.ChatRoom;
import com.example.demo.domain.chat.service.ChatRoomService;
import com.example.demo.global.auth.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat/rooms")
public class ChatRoomController {
    private final ChatRoomService chatRoomService;

    /**
     * 1:1 채팅방 생성 or 조회
     */
    @PostMapping("/direct")
    public ResponseEntity<Long> getOrCreateDirectRoom(
            @RequestParam Long partnerId,
            JwtAuthentication auth
    ) {
        Long requesterId = auth.getUserId();
        ChatRoom room = chatRoomService.findOrCreateDirectRoom(requesterId, partnerId, requesterId);
        return ResponseEntity.ok(room.getId());
    }


    @PostMapping("/group")
    public ResponseEntity<Long> createGroupRoom(
            @RequestBody CreateGroupRoomRequest request,
            JwtAuthentication auth
    ) {
        Long roomId = chatRoomService.createGroupRoomWithCreator(request, auth.getUserId());
        return ResponseEntity.ok(roomId);
    }

    @PostMapping("/{roomId}/invite")
    public ResponseEntity<Void> inviteUserToRoom(
            @PathVariable Long roomId,
            @RequestBody InviteUserRequest request,
            JwtAuthentication auth
    ) {
        chatRoomService.inviteToGroupRoomWithValidation(roomId, request.getInviteeId(), auth.getUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomSummaryResponse>> getMyChatRooms(
            JwtAuthentication auth
    ) {
        List<ChatRoomSummaryResponse> myRooms = chatRoomService.getRoomsByUserId(auth.getUserId());
        return ResponseEntity.ok(myRooms);
    }

    @DeleteMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            JwtAuthentication auth
    ) {
        chatRoomService.leaveRoom(roomId, auth.getUserId());
        return ResponseEntity.ok().build();
    }

    //→ 사용자가 참여 중인 1:1 채팅방을 본인 기준으로 숨깁니다. (soft delete)
    //→ 그룹 채팅방에는 사용할 수 없습니다.
    @DeleteMapping("/{roomId}/hide")
    public ResponseEntity<Void> hideDirectRoom(
            @PathVariable Long roomId,
            JwtAuthentication auth
    ) {
        chatRoomService.hideDirectRoom(roomId, auth.getUserId());
        return ResponseEntity.ok().build();
    }

}
