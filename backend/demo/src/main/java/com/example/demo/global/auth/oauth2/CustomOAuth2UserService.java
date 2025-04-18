package com.example.demo.global.auth.oauth2;


import co.elastic.clients.elasticsearch.ElasticsearchClient;
import com.example.demo.domain.member.user.entity.User;
import com.example.demo.domain.member.user.entity.UserDocument;
import com.example.demo.domain.member.user.entity.UserEsDocument;
import com.example.demo.domain.member.user.repository.UserMongoRepository;
import com.example.demo.domain.member.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final UserMongoRepository userMongoRepository;
    private final ElasticsearchClient elasticsearchClient;

    @Getter
    private User user;
    @Getter
    private boolean isNewUser;

    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 유저 정보(attributes) 가져오기
        Map<String, Object> oAuth2UserAttributes = super.loadUser(userRequest).getAttributes();

        // 2. resistrationId 가져오기 (third-party id)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 3. userNameAttributeName 가져오기
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        // 4. 유저 정보 dto 생성
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfo.of(registrationId, oAuth2UserAttributes);

        // 5. 회원가입 및 로그인
        saveOrUpdate(oAuth2UserInfo);

        // 6. OAuth2User로 반환
        return new PrincipalDetails(user, oAuth2UserAttributes, userNameAttributeName);
    }

    private void saveOrUpdate(OAuth2UserInfo oAuth2UserInfo) {
        if(userRepository.existsByEmail(oAuth2UserInfo.getEmail())){
            user = userRepository.findByEmail(oAuth2UserInfo.getEmail())
                    .orElseThrow(() -> new RuntimeException("UserNotFoundException"));
            isNewUser = false;
        } else {
            isNewUser = true;
            user = userRepository.save(oAuth2UserInfo.toEntity());
//            syncWithMongo(user);
            syncWithElasticsearch(user);
        }
    }

    private void syncWithMongo(User user) {
        userMongoRepository.save(UserDocument.from(user));
    }

    private void syncWithElasticsearch(User user) {
        try {
            UserEsDocument doc = UserEsDocument.from(user);
            elasticsearchClient.index(i -> i
                    .index("user") // 인덱스 이름 (이미 사용하는 거 유지)
                    .id(doc.getId()) // 고유 ID 설정
                    .document(doc)
            );
        } catch (IOException e) {
            log.error("Elasticsearch 저장 실패: {}", e.getMessage(), e);
        }
    }

}
